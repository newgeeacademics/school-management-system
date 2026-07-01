package com.classroom.backend.scheduler;

import com.classroom.backend.service.PlatformDailyReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PlatformDailyReportScheduler {

    private final PlatformDailyReportService platformDailyReportService;

    /** Every day at 00:00 GMT. */
    @Scheduled(cron = "${app.reports.daily.cron:0 0 0 * * *}", zone = "${app.reports.daily.zone:GMT}")
    public void sendDailyPlatformReport() {
        log.info("Running scheduled daily platform report");
        platformDailyReportService.sendDailyReportIfEnabled();
    }
}
