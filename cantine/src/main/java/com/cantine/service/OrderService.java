package com.cantine.service;

import com.cantine.dto.OrderRequest;
import com.cantine.entity.Menu;
import com.cantine.entity.Order;
import com.cantine.entity.OrderItem;
import com.cantine.entity.User;
import com.cantine.repository.MenuRepository;
import com.cantine.repository.OrderRepository;
import com.cantine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import com.cantine.entity.User;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final MenuRepository menuRepository;

    @Transactional
    public Order createOrder(OrderRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Order order = new Order();
        order.setUser(user);
        order.setStatus("en_attente");
        order.setCreatedAt(LocalDateTime.now());

        List<OrderItem> items = new ArrayList<>();
        double total = 0.0;

        for (OrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            Menu menu = menuRepository.findById(itemRequest.getMenuId())
                    .orElseThrow(() -> new RuntimeException("Menu introuvable"));

            if (!menu.getAvailable()) {
                throw new RuntimeException("Le plat " + menu.getDishName() + " n'est pas disponible");
            }

            OrderItem item = new OrderItem();
            item.setMenu(menu);
            item.setOrder(order);
            item.setQuantity(itemRequest.getQuantity());
            item.setSubtotal(menu.getPrice() * itemRequest.getQuantity());

            total += item.getSubtotal();
            items.add(item);
        }

        order.setOrderItems(items);
        order.setTotalPrice(total);

        return orderRepository.save(order);
    }

    public List<Order> getMyOrders() {
        User currentUser = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return orderRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(status);
    }

    public Order updateStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande introuvable"));

        List<String> validStatuses = List.of(
                "en_attente", "en_preparation", "prete", "servie", "annulee"
        );

        if (!validStatuses.contains(status)) {
            throw new RuntimeException("Statut invalide");
        }

        order.setStatus(status);
        return orderRepository.save(order);
    }

    public void cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande introuvable"));
        order.setStatus("annulee");
        orderRepository.save(order);
    }
}