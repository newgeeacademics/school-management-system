package com.classroom.backend.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;

@Configuration
@Profile("production")
public class ProductionDatabaseConfig {

    @Bean
    public DataSource dataSource(@Value("${DATABASE_URL}") String databaseUrl) {
        DatabaseUrlParser.Parsed parsed = DatabaseUrlParser.parse(databaseUrl);

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(parsed.jdbcUrl());
        dataSource.setDriverClassName("org.postgresql.Driver");

        if (parsed.username() != null) {
            dataSource.setUsername(parsed.username());
            dataSource.setPassword(parsed.password());
        }

        return dataSource;
    }
}
