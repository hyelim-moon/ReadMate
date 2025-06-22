package RM.ReadMate.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long validityInMilliseconds;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expirationInMilliseconds
    ) {
        if (secret.length() < 32) {
            throw new IllegalArgumentException("JWT Secret key must be at least 32 characters (for HMAC SHA-256)");
        }
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.validityInMilliseconds = expirationInMilliseconds;
    }

    // 토큰 생성 (sub: userid)
    public String createToken(String userid) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + validityInMilliseconds);

        return Jwts.builder()
                .setSubject(userid)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // 토큰에서 userid 추출
    public String getUseridFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.err.println("🔒 JWT 만료됨: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.err.println("🔒 지원하지 않는 JWT 형식: " + e.getMessage());
        } catch (MalformedJwtException e) {
            System.err.println("🔒 JWT 구조 이상: " + e.getMessage());
        } catch (SignatureException e) {
            System.err.println("🔒 JWT 서명 불일치: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.err.println("🔒 JWT 파라미터 없음: " + e.getMessage());
        }

        return false;
    }
}
