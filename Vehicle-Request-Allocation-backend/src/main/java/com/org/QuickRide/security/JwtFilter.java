package com.org.QuickRide.security;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final SecretKey SECRET_KEY =
            Keys.secretKeyFor(SignatureAlgorithm.HS512);

    private static final long EXPIRATION_TIME = 3600000;

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY)
                .compact();
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // ✅ Allow OPTIONS (CORS)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String uri = request.getRequestURI();

        // 🔓 ALWAYS PUBLIC APIs
        if (uri.contains("/userLogin")
                || uri.contains("/signup")
                || uri.contains("/send-otp")
                || uri.contains("/update-password")
                || uri.contains("/driverRegistration")
        	    || uri.contains("/driverLogin")) {

            filterChain.doFilter(request, response);
            return;
        }

        // 🚗 VEHICLE APIs → CONDITIONAL JWT
        if (uri.startsWith("/api/v1/getVehical")) {

            String authRequired = request.getHeader("X-Auth-Required");

            // ❌ JWT NOT REQUIRED
            if (authRequired == null || authRequired.equalsIgnoreCase("false")) {
                filterChain.doFilter(request, response);
                return;
            }

            // 🔒 JWT REQUIRED → validate below
            if (!validateJwt(request, response)) {
                return;
            }

            filterChain.doFilter(request, response);
            return;
        }

        // 🔒 ALL OTHER APIs → JWT REQUIRED
        if (!validateJwt(request, response)) {
            return;
        }

        filterChain.doFilter(request, response);
    }

    // ================= JWT VALIDATION =================

    private boolean validateJwt(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing JWT token");
            return false;
        }

        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseClaimsJws(authHeader.substring(7))
                    .getBody();

            String username = claims.getSubject();

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            new ArrayList<>()
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            return true;

        } catch (Exception e) {
            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Invalid or expired JWT"
            );
            return false;
        }
    }
}
