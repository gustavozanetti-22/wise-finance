package com.finfinance.config;

import com.finfinance.entity.Category;
import com.finfinance.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    public DataInitializer(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {

        List<String> categories = List.of(
                "Alimentação",
                "Moradia",
                "Transporte",
                "Saúde",
                "Educação",
                "Lazer",
                "Assinaturas",
                "Salário",
                "Outros"
        );

        categories.forEach(name -> {

            if (!categoryRepository.existsByName(name)) {
                categoryRepository.save(new Category(name));
            }

        });
    }
}