package edu.srmist.od;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import javax.imageio.ImageIO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "${app.cors}")
public class AuthController {
    @Autowired
    UserRepo users;

    @Autowired
    Auth auth;

    @Value("${app.demo-otp}")
    String otp;

    @Value("${app.upload-dir}")
    String dir;

    final Map<String, String> caps = new ConcurrentHashMap<>();

    ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    /** Server-side captcha. Replace with reCAPTCHA/Turnstile verification here if preferred. */
    @GetMapping("/auth/captcha")
    public Map<String, String> captcha() throws IOException {
        String characters = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        String value = "";
        Random random = new SecureRandom();

        for (int i = 0; i < 5; i++) {
            value += characters.charAt(random.nextInt(characters.length()));
        }

        BufferedImage image = new BufferedImage(
                120,
                44,
                BufferedImage.TYPE_INT_RGB
        );
        Graphics2D graphics = image.createGraphics();
        graphics.setColor(new Color(244, 249, 255));
        graphics.fillRect(0, 0, 120, 44);
        graphics.setColor(new Color(98, 185, 242));

        for (int i = 0; i < 6; i++) {
            graphics.drawLine(
                    random.nextInt(120),
                    random.nextInt(44),
                    random.nextInt(120),
                    random.nextInt(44)
            );
        }

        graphics.setFont(new Font("Serif", Font.BOLD, 26));
        graphics.setColor(new Color(30, 58, 110));

        for (int i = 0; i < 5; i++) {
            graphics.rotate(
                    (random.nextDouble() - .5) * .4,
                    10 + i * 21,
                    30
            );
            graphics.drawString(String.valueOf(value.charAt(i)), 10 + i * 21, 30);
            graphics.setTransform(new AffineTransform());
        }

        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "png", output);

        String id = UUID.randomUUID().toString();
        caps.put(id, value);

        return Map.of(
                "id",
                id,
                "image",
                "data:image/png;base64," + Base64.getEncoder().encodeToString(output.toByteArray())
        );
    }

    /** TODO: generate a random OTP, store with expiry, email netid@srmist.edu.in. Demo uses a fixed OTP. */
    @PostMapping("/auth/otp")
    public Map<String, Boolean> sendOtp(@RequestBody Map<String, String> body) {
        System.out.println("OTP requested for " + body.get("netid"));
        return Map.of("ok", true);
    }

    @PostMapping("/auth/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        String captcha = caps.remove(body.get("captchaId"));
        if (
                captcha == null
                        || !captcha.equalsIgnoreCase(
                                String.valueOf(body.get("captchaAnswer")).trim()
                        )
        ) {
            throw bad("Captcha does not match");
        }

        if (!otp.equals(body.get("otp"))) {
            throw bad("Invalid OTP");
        }

        String netid = body.get("netid")
                .trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9._-]", "");
        String role = body.get("role");
        User user = users.findById(netid).orElse(null);

        if (user == null && "student".equals(role)) {
            user = new User();
            user.netid = netid;
            user.name = netid;
            user.role = "student";
            user.dept = "CSE";
            users.save(user);
        } // TODO: look up in SRM student directory

        if (user == null || !user.role.equals(role)) {
            throw bad("No " + role + " account for this NetID");
        }

        return Map.of("token", auth.issue(netid), "user", user);
    }

    @GetMapping("/me")
    public User me(@RequestHeader("Authorization") String header) {
        return auth.user(header);
    }

    @PostMapping("/profile")
    public User profile(
            @RequestHeader("Authorization") String header,
            @RequestParam MultipartFile photo,
            @RequestParam MultipartFile document,
            @RequestParam String docType
    ) throws IOException {
        User user = auth.user(header);
        Path directory = Path.of(dir, user.netid);
        Files.createDirectories(directory);
        photo.transferTo(directory.resolve("photo").toAbsolutePath());
        document.transferTo(directory.resolve("document").toAbsolutePath());
        user.docType = docType;
        user.profileDone = true;
        return users.save(user);
    }

    @GetMapping("/photo/{id}")
    public ResponseEntity<byte[]> photo(@PathVariable String id) throws IOException {
        Path photo = Path.of(dir, id, "photo");
        if (!users.existsById(id) || !Files.exists(photo)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(Files.readAllBytes(photo));
    }
}
