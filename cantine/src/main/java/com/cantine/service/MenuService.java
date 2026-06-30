package com.cantine.service;

import com.cantine.entity.Menu;
import com.cantine.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuRepository menuRepository;

    public List<Menu> getAllMenus() {
        return menuRepository.findAll();
    }

    public List<Menu> getMenusByDate(LocalDate date) {
        return menuRepository.findByMenuDate(date);
    }

    public List<Menu> getAvailableMenus() {
        return menuRepository.findByAvailableTrue();
    }

    public Menu createMenu(Menu menu) {
        if (menu.getMenuDate() == null) {
            menu.setMenuDate(LocalDate.now());
        }
        if (menu.getAvailable() == null) {
            menu.setAvailable(true);
        }
        return menuRepository.save(menu);
    }

    public Menu updateMenu(Long id, Menu updatedMenu) {
        Menu existing = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu introuvable"));

        existing.setDishName(updatedMenu.getDishName());
        existing.setPrice(updatedMenu.getPrice());
        existing.setAvailable(updatedMenu.getAvailable());
        existing.setMenuDate(updatedMenu.getMenuDate());
        existing.setImage(updatedMenu.getImage());

        return menuRepository.save(existing);
    }

    public void deleteMenu(Long id) {
        if (!menuRepository.existsById(id)) {
            throw new RuntimeException("Menu introuvable");
        }
        menuRepository.deleteById(id);
    }

    public Menu toggleAvailability(Long id) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu introuvable"));
        menu.setAvailable(!menu.getAvailable());
        return menuRepository.save(menu);
    }
}