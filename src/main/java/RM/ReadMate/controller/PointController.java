package RM.ReadMate.controller;

import RM.ReadMate.entity.Product;
import RM.ReadMate.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/points")
@CrossOrigin(origins = "http://localhost:3000")
public class PointController {

    private final ProductService productService;

    public PointController(ProductService productService){
        this.productService = productService;
    }

    @GetMapping("/products")
    public List<Product> getProducts() {
        return productService.getAllProducts();
    }
}
