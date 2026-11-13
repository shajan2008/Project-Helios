package edu.srmist.od;

import java.security.MessageDigest;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/**
 * Minimal signed bearer token (HMAC-SHA256, 8h).
 * Swap for Spring Security + JWT / SRM SSO when going live.
 */
@Component
public class Auth {
    @Value("${app.secret}")
    String secret;

    @Autowired
    UserRepo users;

    String mac(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(), "HmacSHA256"));
            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(mac.doFinal(value.getBytes()));
        } catch (Exception exception) {
            throw new RuntimeException(exception);
        }
    }

    public String issue(String netid) {
        String payload = netid + "|" + (System.currentTimeMillis() + 8 * 3600_000L);
        String encodedPayload = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(payload.getBytes());

        return encodedPayload + "." + mac(payload);
    }

    public User user(String header) {
        try {
            String[] tokenParts = header.substring(7).split("\\.");
            String payload = new String(Base64.getUrlDecoder().decode(tokenParts[0]));

            if (!MessageDigest.isEqual(mac(payload).getBytes(), tokenParts[1].getBytes())) {
                throw new Exception();
            }

            String[] payloadParts = payload.split("\\|");
            if (Long.parseLong(payloadParts[1]) < System.currentTimeMillis()) {
                throw new Exception();
            }

            return users.findById(payloadParts[0]).orElseThrow();
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please sign in again"
            );
        }
    }
}
