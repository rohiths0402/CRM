package com.productionhouse.crm.controller;

import com.productionhouse.crm.common.CrudController;
import com.productionhouse.crm.entity.ShootingLocation;
import com.productionhouse.crm.repository.ShootingLocationRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/locations")
public class ShootingLocationController extends CrudController<ShootingLocation> {

    public ShootingLocationController(ShootingLocationRepository repository) {
        super(repository, "Location");
    }
}
