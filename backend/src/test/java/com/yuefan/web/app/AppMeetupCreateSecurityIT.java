package com.yuefan.web.app;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AppMeetupCreateSecurityIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void postMeetupWithoutBearer_isPermittedAndSucceeds() throws Exception {
        String body =
                "{\"title\":\"测试活动\",\"locationLabel\":\"某地\",\"timeLabel\":\"周六 12:00\",\"totalSlots\":6,\"publicInvite\":true}";
        mockMvc.perform(post("/api/app/meetups").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.id").exists());
    }

    /** 模拟小程序/开发者工具可能带的非 ASCII Header，避免 StrictHttpFirewall 误拦为 403 */
    @Test
    void postMeetup_withNonAsciiHeaderValue_ok() throws Exception {
        String body =
                "{\"title\":\"Header测试\",\"locationLabel\":\"某地\",\"timeLabel\":\"周日\",\"totalSlots\":4,\"publicInvite\":true}";
        mockMvc.perform(
                        post("/api/app/meetups")
                                .contentType(MediaType.APPLICATION_JSON)
                                .header("X-Client-Trace", "微信-trace-测试")
                                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    /** 模拟 HTTPS 工具页访问本机 http 私网 API（Private Network Access） */
    @Test
    void preflightPrivateNetwork_thenPost_ok() throws Exception {
        mockMvc.perform(
                        options("/api/app/meetups")
                                .header(HttpHeaders.ORIGIN, "https://servicewechat.com")
                                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                                .header(
                                        HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS,
                                        "content-type,authorization")
                                .header("Access-Control-Request-Private-Network", "true"))
                .andExpect(status().isOk())
                .andExpect(header().exists(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN))
                .andExpect(header().string("Access-Control-Allow-Private-Network", "true"));

        String body =
                "{\"title\":\"PNA测\",\"locationLabel\":\"某地\",\"timeLabel\":\"周二\",\"totalSlots\":4,\"publicInvite\":true}";
        mockMvc.perform(
                        post("/api/app/meetups")
                                .header(HttpHeaders.ORIGIN, "https://servicewechat.com")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }
}
