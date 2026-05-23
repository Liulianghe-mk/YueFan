package com.yuefan.web.admin;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class AdminAppUserAccountIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void listAppUsers_includesDemoAccountFields() throws Exception {
        String token = adminToken();
        mockMvc.perform(
                        get("/api/admin/app-users")
                                .param("keyword", "demo")
                                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.content[0].username").value("demo"))
                .andExpect(jsonPath("$.data.content[0].accountLogin").value(true))
                .andExpect(jsonPath("$.data.content[0].openid").value("acct:demo"));
    }

    private String adminToken() throws Exception {
        MvcResult res =
                mockMvc.perform(
                                post("/api/admin/auth/login")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(
                                                "{\"username\":\"admin\",\"password\":\"admin123\"}"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.code").value(0))
                        .andReturn();
        return com.jayway.jsonpath.JsonPath.read(
                res.getResponse().getContentAsString(), "$.data.accessToken");
    }
}
