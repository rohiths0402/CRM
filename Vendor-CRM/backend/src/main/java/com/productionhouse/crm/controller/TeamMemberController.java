package com.productionhouse.crm.controller;

import com.productionhouse.crm.common.CrudController;
import com.productionhouse.crm.entity.TeamMember;
import com.productionhouse.crm.entity.User;
import com.productionhouse.crm.exception.ApiException;
import com.productionhouse.crm.repository.CoordinationTaskRepository;
import com.productionhouse.crm.repository.TeamMemberRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/team-members")
public class TeamMemberController extends CrudController<TeamMember> {

    private final CoordinationTaskRepository taskRepository;

    public TeamMemberController(TeamMemberRepository repository, CoordinationTaskRepository taskRepository) {
        super(repository, "Team member");
        this.taskRepository = taskRepository;
    }

    // Same rule as the UI: tasks link to members by name.
    @Override
    protected void beforeDelete(User user, TeamMember existing) {
        long assigned = taskRepository.countByOwnerIdAndAssignee(user.getWorkspaceId(), existing.getName());
        if (assigned > 0) {
            throw new ApiException(HttpStatus.CONFLICT,
                    existing.getName() + " still has " + assigned + " assigned task(s). Reassign them first.");
        }
    }
}
