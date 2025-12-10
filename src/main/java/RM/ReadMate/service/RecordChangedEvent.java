package RM.ReadMate.service;

import org.springframework.context.ApplicationEvent;

public class RecordChangedEvent extends ApplicationEvent {
    private final Long userId;

    public RecordChangedEvent(Object source, Long userId) {
        super(source);
        this.userId = userId;
    }

    public Long getUserId() {
        return userId;
    }
}
