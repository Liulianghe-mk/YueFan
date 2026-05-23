package com.yuefan.web.app;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

@SpringBootTest
@AutoConfigureMockMvc
class AppMeSecurityIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String devToken() throws Exception {
        MvcResult login =
                mockMvc.perform(
                                MockMvcRequestBuilders.post("/api/app/auth/login")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content("{\"code\":\"dev\"}"))
                        .andExpect(status().isOk())
                        .andReturn();
        JsonNode root = objectMapper.readTree(login.getResponse().getContentAsString());
        return root.path("data").path("accessToken").asText();
    }

    @Test
    void preflightPrivateNetwork_thenPut_ok() throws Exception {
        mockMvc.perform(
                        options("/api/app/me")
                                .header(HttpHeaders.ORIGIN, "https://servicewechat.com")
                                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "PUT")
                                .header(
                                        HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS,
                                        "content-type,authorization")
                                .header("Access-Control-Request-Private-Network", "true"))
                .andExpect(status().isOk())
                .andExpect(header().exists(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN))
                .andExpect(header().string("Access-Control-Allow-Private-Network", "true"));

        String token = devToken();
        String body = "{\"nickname\":\"注册测试\",\"avatarUrl\":\"\",\"bio\":\"简介\"}";
        mockMvc.perform(
                        put("/api/app/me")
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                .header(HttpHeaders.ORIGIN, "https://servicewechat.com")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.profileComplete").value(true));
    }

    @Test
    void putMe_withNonAsciiHeaderValue_ok() throws Exception {
        String token = devToken();
        String body = "{\"nickname\":\"昵称测试\",\"bio\":\"\"}";
        mockMvc.perform(
                        put("/api/app/me")
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                .header("X-Client-Trace", "微信-trace-测试")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }
}
