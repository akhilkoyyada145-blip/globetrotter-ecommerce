package com.globetrotter.globetrotterbackend.dto;

import lombok.Data;

@Data
public class CreateOrderRequest {
    private String shippingAddress;
    private String paymentMethod;
}