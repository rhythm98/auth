//package com.fintegerllp.authapi.config;
//
//import jakarta.servlet.*;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.core.Ordered;
//import org.springframework.core.annotation.Order;
//import org.springframework.stereotype.Component;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import java.io.IOException;
//
//@Component
//@Order(Ordered.HIGHEST_PRECEDENCE)
//public class CorsFilter extends OncePerRequestFilter {
//
//    @Value("${app.cors.allowed-origins}")
//    private String allowedOrigins;
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
//            throws ServletException, IOException {
//        System.out.println("CorsFilter - Processing request: " + request.getRequestURI());
////        HttpServletResponse response = (HttpServletResponse) res;
////        HttpServletRequest request = (HttpServletRequest) req;
////        System.out.println("CORS Filter - Before setting headers");
////        // Log to confirm the value being used - // Instead of using the value directly, check the origin from the request
////        String requestUri = request.getRequestURI();
////        String method = request.getMethod();
////        String origin = request.getHeader("Origin");
////
////        System.out.println("CORS Filter - Request URI: " + requestUri);
////        System.out.println("CORS Filter - Method: " + method);
////        System.out.println("CORS Filter - Origin: " + origin);
////        System.out.println("CORS Filter - Allowed Origins: " + allowedOrigins);
//
//
//        // If the origin matches our allowed origins, set it in the response
////        if (origin != null && allowedOrigins.contains(origin)) {
////            response.setHeader("Access-Control-Allow-Origin", origin);
////        } else {
////            // Default to your configured value if no match
////            response.setHeader("Access-Control-Allow-Origin", allowedOrigins);
////        }
//
////        response.setHeader("Access-Control-Allow-Origin", allowedOrigins);
//        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
//        response.setHeader("Access-Control-Allow-Credentials", "true");
//        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//        response.setHeader("Access-Control-Max-Age", "3600");
//        response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, remember-me, X-XSRF-TOKEN");
//        System.out.println("CORS Filter - After setting headers - Access-Control-Allow-Origin: " + response.getHeader("Access-Control-Allow-Origin"));
//
//
//        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
//            response.setStatus(HttpServletResponse.SC_OK);
//        } else {
//            // Add a response wrapper to check headers after chain execution
////            HeaderCheckResponseWrapper responseWrapper = new HeaderCheckResponseWrapper(response);
////            chain.doFilter(req, responseWrapper);
////
////            // Log after chain execution
////            System.out.println("CORS Filter - After chain execution - Access-Control-Allow-Origin: " + responseWrapper.getHeader("Access-Control-Allow-Origin"));
//            filterChain.doFilter(request, response);
//        }
//    }
//    // Response wrapper class to check headers
////    private static class HeaderCheckResponseWrapper extends HttpServletResponseWrapper {
////        public HeaderCheckResponseWrapper(HttpServletResponse response) {
////            super(response);
////        }
////    }
//}