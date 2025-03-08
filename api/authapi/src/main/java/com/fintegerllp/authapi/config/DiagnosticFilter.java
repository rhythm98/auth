//package com.fintegerllp.authapi.config;
//
//import jakarta.servlet.*;
//import jakarta.servlet.http.HttpServletResponse;
//import org.springframework.core.Ordered;
//import org.springframework.core.annotation.Order;
//import org.springframework.stereotype.Component;
//
//import java.io.IOException;
//import java.util.Collection;
//
//@Component
//@Order(Ordered.LOWEST_PRECEDENCE)
//public class DiagnosticFilter implements Filter {
//    @Override
//    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
//            throws IOException, ServletException {
//        HttpServletResponse httpResponse = (HttpServletResponse) response;
//
//        // Process the request
//        chain.doFilter(request, response);
//
//        // Log all response headers after all filters have executed
//        System.out.println("DIAGNOSTIC FILTER - Final headers:");
//        Collection<String> headerNames = httpResponse.getHeaderNames();
//        for (String headerName : headerNames) {
//            System.out.println("HEADER: " + headerName + " = " + httpResponse.getHeader(headerName));
//        }
//    }
//}