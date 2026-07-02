package com.sciencetoppers.api.service;

import org.springframework.stereotype.Service;

@Service
public class YoutubeProxyService {

    /**
     * Now that the frontend uses a custom react-player to encapsulate the video,
     * we can pass the raw URL directly to the frontend.
     */
    public String getProxiedUrl(String rawUrl) {
        return rawUrl;
    }
}
