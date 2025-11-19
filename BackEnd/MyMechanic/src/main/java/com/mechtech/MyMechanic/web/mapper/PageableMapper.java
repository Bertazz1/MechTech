package com.mechtech.MyMechanic.web.mapper;

import com.mechtech.MyMechanic.web.dto.pageable.PageableDto;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

@Component
public class PageableMapper {

    public PageableDto toDto(Page page) {
        if (page == null) {
            return null;
        }
        PageableDto dto = new PageableDto();
        dto.setContent(page.getContent());
        dto.setFirst(page.isFirst());
        dto.setLast(page.isLast());
        dto.setNumber(page.getNumber());
        dto.setSize(page.getSize());
        dto.setNumberOfElements(page.getNumberOfElements());
        dto.setTotalPages(page.getTotalPages());
        dto.setTotalElements((int) page.getTotalElements());
        return dto;
    }
}