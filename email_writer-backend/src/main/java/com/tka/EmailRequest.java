package com.tka;

import lombok.Data;

@Data
public class EmailRequest {
    private String emailContent;
    private String tone;
    private String receiverName;
private String senderName;
}
