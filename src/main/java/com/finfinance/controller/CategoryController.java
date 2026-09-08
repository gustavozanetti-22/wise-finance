package com.finfinance.controller;

import com.finfinance.dto.CategoryResponse;
import com.finfinance.repository.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(
            CategoryRepository categoryRepository) {

        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories() {

        List<CategoryResponse> categories =
                categoryRepository.findAll()
                        .stream()
                        .map(category ->
                                new CategoryResponse(
                                        category.getId(),
                                        category.getName()
                                )
                        )
                        .toList();

        return ResponseEntity.ok(categories);
    }
}