package com.yuefan.web.dto;

import java.util.List;

public record MyActivitiesResponse(
        List<MyActivityItemResponse> upcoming,
        List<MyActivityItemResponse> ended,
        int initiatedCount,
        int pendingApplicationsTotal) {}
