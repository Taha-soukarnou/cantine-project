package com.cantine.repository;

import com.cantine.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
    List<Menu> findByMenuDate(LocalDate date);
    List<Menu> findByAvailableTrue();
    List<Menu> findByMenuDateGreaterThanEqual(LocalDate date);
}