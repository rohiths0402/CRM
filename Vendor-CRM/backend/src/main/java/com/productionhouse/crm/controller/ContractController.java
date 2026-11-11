package com.productionhouse.crm.controller;

import com.productionhouse.crm.common.CrudController;
import com.productionhouse.crm.entity.Contract;
import com.productionhouse.crm.repository.ContractRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/contracts")
public class ContractController extends CrudController<Contract> {

    public ContractController(ContractRepository repository) {
        super(repository, "Contract");
    }
}
