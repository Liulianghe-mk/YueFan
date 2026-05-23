package com.yuefan.web.app;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AppAccountAuthIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void loginAccount_demoUser_ok() throws Exception {
        mockMvc.perform(
                        post("/api/app/auth/login-account")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"username\":\"demo\",\"password\":\"demo123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty());
    }

    @Test
    void registerThenLogin_ok() throws Exception {
        String register =
                """
                {"username":"testuser01","password":"pass1234","nickname":"测试用户","avatarUrl":"","bio":""}
                """;
        mockMvc.perform(
                        post("/api/app/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(register))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        mockMvc.perform(
                        post("/api/app/auth/login-account")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"username\":\"testuser01\",\"password\":\"pass1234\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty());
    }

    @Test
    void loginAccount_wrongPassword_unauthorized() throws Exception {
        mockMvc.perform(
                        post("/api/app/auth/login-account")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"username\":\"demo\",\"password\":\"wrongpass\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.message").value("用户名或密码错误"));
    }
}
