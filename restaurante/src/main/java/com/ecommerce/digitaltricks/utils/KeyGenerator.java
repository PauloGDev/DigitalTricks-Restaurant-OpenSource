package com.ecommerce.digitaltricks.utils;

import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.io.Encoders;

public class KeyGenerator {
    public static void main(String[] args) {
        String base64Key = Encoders.BASE64.encode(
                Keys.secretKeyFor(SignatureAlgorithm.HS256).getEncoded()
        );
        System.out.println("Sua chave segura: " + base64Key);
    }
}
