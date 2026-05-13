package com.classroom.backend.service;

import com.classroom.backend.dto.request.RoomRequest;
import com.classroom.backend.model.Room;
import com.classroom.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;

    public List<Room> findAll() {
        return roomRepository.findAll();
    }

    public Room findById(String id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found: " + id));
    }

    @Transactional
    public Room create(RoomRequest request) {
        Room room = Room.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .build();
        return roomRepository.save(room);
    }

    @Transactional
    public Room update(String id, RoomRequest request) {
        Room room = findById(id);
        room.setName(request.getName());
        room.setType(request.getType());
        room.setCapacity(request.getCapacity());
        return roomRepository.save(room);
    }

    @Transactional
    public void delete(String id) {
        roomRepository.deleteById(id);
    }
}
