package com.productionhouse.crm.controller;

import com.productionhouse.crm.common.CrudController;
import com.productionhouse.crm.entity.ProductionHouse;
import com.productionhouse.crm.repository.ProductionHouseRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/production-houses")
public class ProductionHouseController extends CrudController<ProductionHouse> {

    public ProductionHouseController(ProductionHouseRepository repository) {
        super(repository, "Production house");
    }
}
