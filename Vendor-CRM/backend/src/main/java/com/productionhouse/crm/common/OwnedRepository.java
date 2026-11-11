package com.productionhouse.crm.common;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface OwnedRepository<E extends BaseEntity> extends JpaRepository<E, Long> {

    List<E> findAllByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    Optional<E> findByIdAndOwnerId(Long id, Long ownerId);

    long countByOwnerId(Long ownerId);
}
