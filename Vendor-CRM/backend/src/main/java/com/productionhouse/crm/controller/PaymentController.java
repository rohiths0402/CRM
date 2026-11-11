package com.productionhouse.crm.controller;

import com.productionhouse.crm.common.CrudController;
import com.productionhouse.crm.entity.Payment;
import com.productionhouse.crm.repository.PaymentRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payments")
public class PaymentController extends CrudController<Payment> {

    public PaymentController(PaymentRepository repository) {
        super(repository, "Payment");
    }
}
