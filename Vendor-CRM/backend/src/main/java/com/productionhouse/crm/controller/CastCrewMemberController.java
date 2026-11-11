package com.productionhouse.crm.controller;

import com.productionhouse.crm.common.CrudController;
import com.productionhouse.crm.entity.CastCrewMember;
import com.productionhouse.crm.repository.CastCrewMemberRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cast-crew")
public class CastCrewMemberController extends CrudController<CastCrewMember> {

    public CastCrewMemberController(CastCrewMemberRepository repository) {
        super(repository, "Cast or crew member");
    }
}
