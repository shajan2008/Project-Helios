package edu.srmist.od;
import java.awt.*;import java.awt.image.BufferedImage;import java.io.*;import java.nio.file.*;import java.security.SecureRandom;import java.util.*;import java.util.concurrent.ConcurrentHashMap;
import javax.imageio.ImageIO;
import org.springframework.beans.factory.annotation.*;import org.springframework.http.*;import org.springframework.web.bind.annotation.*;import org.springframework.web.multipart.MultipartFile;import org.springframework.web.server.ResponseStatusException;
@RestController @RequestMapping("/api") @CrossOrigin(origins="${app.cors}")
public class AuthController {
 @Autowired UserRepo users; @Autowired Auth auth;
 @Value("${app.demo-otp}") String otp; @Value("${app.upload-dir}") String dir;
 final Map<String,String> caps=new ConcurrentHashMap<>();
 ResponseStatusException bad(String m){return new ResponseStatusException(HttpStatus.BAD_REQUEST,m);}

 /** Server-side captcha. Replace with reCAPTCHA/Turnstile verification here if preferred. */
 @GetMapping("/auth/captcha") public Map<String,String> captcha() throws IOException{
  String ch="ABCDEFGHJKMNPQRSTUVWXYZ23456789",a="";Random r=new SecureRandom();for(int i=0;i<5;i++)a+=ch.charAt(r.nextInt(ch.length()));
  BufferedImage im=new BufferedImage(120,44,BufferedImage.TYPE_INT_RGB);Graphics2D g=im.createGraphics();g.setColor(new Color(244,249,255));g.fillRect(0,0,120,44);
  g.setColor(new Color(98,185,242));for(int i=0;i<6;i++)g.drawLine(r.nextInt(120),r.nextInt(44),r.nextInt(120),r.nextInt(44));
  g.setFont(new Font("Serif",Font.BOLD,26));g.setColor(new Color(30,58,110));
  for(int i=0;i<5;i++){g.rotate((r.nextDouble()-.5)*.4,10+i*21,30);g.drawString(""+a.charAt(i),10+i*21,30);g.setTransform(new java.awt.geom.AffineTransform());}
  ByteArrayOutputStream o=new ByteArrayOutputStream();ImageIO.write(im,"png",o);String id=UUID.randomUUID().toString();caps.put(id,a);
  return Map.of("id",id,"image","data:image/png;base64,"+Base64.getEncoder().encodeToString(o.toByteArray()));}

 /** TODO: generate a random OTP, store with expiry, email netid@srmist.edu.in. Demo uses a fixed OTP. */
 @PostMapping("/auth/otp") public Map<String,Boolean> sendOtp(@RequestBody Map<String,String> b){System.out.println("OTP requested for "+b.get("netid"));return Map.of("ok",true);}

 @PostMapping("/auth/login") public Map<String,Object> login(@RequestBody Map<String,String> b){
  String a=caps.remove(b.get("captchaId"));
  if(a==null||!a.equalsIgnoreCase(String.valueOf(b.get("captchaAnswer")).trim()))throw bad("Captcha does not match");
  if(!otp.equals(b.get("otp")))throw bad("Invalid OTP");
  String id=b.get("netid").trim().toLowerCase().replaceAll("[^a-z0-9._-]",""),role=b.get("role");
  User u=users.findById(id).orElse(null);
  if(u==null&&"student".equals(role)){u=new User();u.netid=id;u.name=id;u.role="student";u.dept="CSE";users.save(u);} // TODO: look up in SRM student directory
  if(u==null||!u.role.equals(role))throw bad("No "+role+" account for this NetID");
  return Map.of("token",auth.issue(id),"user",u);}

 @GetMapping("/me") public User me(@RequestHeader("Authorization") String h){return auth.user(h);}

 @PostMapping("/profile") public User profile(@RequestHeader("Authorization") String h,@RequestParam MultipartFile photo,@RequestParam MultipartFile document,@RequestParam String docType) throws IOException{
  User u=auth.user(h);Path d=Path.of(dir,u.netid);Files.createDirectories(d);
  photo.transferTo(d.resolve("photo").toAbsolutePath());document.transferTo(d.resolve("document").toAbsolutePath());
  u.docType=docType;u.profileDone=true;return users.save(u);}

 @GetMapping("/photo/{id}") public ResponseEntity<byte[]> photo(@PathVariable String id) throws IOException{
  Path p=Path.of(dir,id,"photo");if(!users.existsById(id)||!Files.exists(p))return ResponseEntity.notFound().build();
  return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(Files.readAllBytes(p));}
}
