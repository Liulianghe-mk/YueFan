package com.yuefan.web.app;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class AppMeAvatarIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void uploadAvatar_returnsPublicUrl() throws Exception {
        uploadAvatarWithContentType("image/jpeg");
    }

    /** 小程序 wx.uploadFile 常不带图片 MIME，仅为 octet-stream */
    @Test
    void uploadAvatar_acceptsOctetStream() throws Exception {
        uploadAvatarWithContentType("application/octet-stream");
    }

    private void uploadAvatarWithContentType(String contentType) throws Exception {
        String token = appToken();
        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "avatar.jpg",
                        contentType,
                        new byte[] {(byte) 0xff, (byte) 0xd8, (byte) 0xff, 0x00, 0x01});

        mockMvc.perform(
                        multipart("/api/app/me/avatar")
                                .file(file)
                                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.avatarUrl").isNotEmpty())
                .andExpect(jsonPath("$.data.avatarUrl").value(org.hamcrest.Matchers.containsString("/uploads/avatars/")));
    }

    private String appToken() throws Exception {
        MvcResult res =
                mockMvc.perform(
                                post("/api/app/auth/login-account")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(
                                                "{\"username\":\"demo\",\"password\":\"demo123\"}"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.code").value(0))
                        .andReturn();
        return com.jayway.jsonpath.JsonPath.read(
                res.getResponse().getContentAsString(), "$.data.accessToken");
    }
}
