package com.productionhouse.crm.common;

import com.productionhouse.crm.entity.User;
import com.productionhouse.crm.exception.ApiException;
import jakarta.validation.Valid;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * The five endpoints every module exposes:
 * GET /, GET /{id}, POST /, PUT /{id}, DELETE /{id}.
 * Subclasses only add @RestController and @RequestMapping.
 */
public abstract class CrudController<E extends BaseEntity> {

    private static final String[] SYSTEM_FIELDS = {"id", "ownerId", "createdAt", "updatedAt"};

    private final OwnedRepository<E> repository;
    private final String label;

    protected CrudController(OwnedRepository<E> repository, String label) {
        this.repository = repository;
        this.label = label;
    }

    @GetMapping
    public List<E> list(@AuthenticationPrincipal User user) {
        return repository.findAllByOwnerIdOrderByCreatedAtDesc(user.getWorkspaceId());
    }

    @GetMapping("/{id}")
    public E get(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return find(user, id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public E create(@AuthenticationPrincipal User user, @Valid @RequestBody E body) {
        beforeSave(user, body, null);
        body.setOwnerId(user.getWorkspaceId());
        E saved = repository.save(body);
        afterChange(user);
        return saved;
    }

    @PutMapping("/{id}")
    @Transactional
    public E update(@AuthenticationPrincipal User user, @PathVariable Long id, @Valid @RequestBody E body) {
        E existing = find(user, id);
        beforeSave(user, body, existing);
        BeanUtils.copyProperties(body, existing, ignoredOnUpdate());
        E saved = repository.save(existing);
        afterChange(user);
        return saved;
    }

    @DeleteMapping("/{id}")
    @Transactional
    public Map<String, Object> delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        E existing = find(user, id);
        beforeDelete(user, existing);
        repository.delete(existing);
        afterChange(user);
        return Map.of("success", true, "message", label + " deleted.");
    }

    /** Hook for checks that need the database, e.g. that a referenced record exists. */
    protected void beforeSave(User user, E body) {
    }

    /** Like beforeSave(user, body), with the stored record on update (null on create). */
    protected void beforeSave(User user, E body, E existing) {
        beforeSave(user, body);
    }

    /** Runs after any create, update or delete, e.g. to refresh totals kept on other records. */
    protected void afterChange(User user) {
    }

    /** Fields the server maintains itself, which an update must not overwrite. */
    protected String[] readOnlyFields() {
        return new String[0];
    }

    private String[] ignoredOnUpdate() {
        return Stream.concat(Arrays.stream(SYSTEM_FIELDS), Arrays.stream(readOnlyFields())).toArray(String[]::new);
    }

    /** Hook to refuse a delete, e.g. while other records still point at it. */
    protected void beforeDelete(User user, E existing) {
    }

    protected E find(User user, Long id) {
        return repository.findByIdAndOwnerId(id, user.getWorkspaceId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, label + " not found."));
    }
}
