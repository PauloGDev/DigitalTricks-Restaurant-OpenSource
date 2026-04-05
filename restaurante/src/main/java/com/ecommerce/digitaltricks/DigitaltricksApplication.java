package com.ecommerce.digitaltricks;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DigitaltricksApplication {

	public static void main(String[] args) {
		// Carrega .env local (apenas dev, nulo em produo com vars de ambiente reais)
		try {
			Dotenv dotenv = Dotenv.configure().ignoreIfMissing().systemProperties().load();
			dotenv.entries().forEach(entry -> {
				if (System.getProperty(entry.getKey()) == null) {
					System.setProperty(entry.getKey(), entry.getValue());
				}
			});
		} catch (Exception e) {
			// ignora em produo onde vars de ambiente ja existem via .env
		}

		SpringApplication.run(DigitaltricksApplication.class, args);
	}

}
