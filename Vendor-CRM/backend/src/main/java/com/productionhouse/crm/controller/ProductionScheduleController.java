package com.productionhouse.crm.controller;

import com.productionhouse.crm.common.CrudController;
import com.productionhouse.crm.entity.ProductionSchedule;
import com.productionhouse.crm.repository.ProductionScheduleRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/schedules")
public class ProductionScheduleController extends CrudController<ProductionSchedule> {

    public ProductionScheduleController(ProductionScheduleRepository repository) {
        super(repository, "Schedule");
    }
}
