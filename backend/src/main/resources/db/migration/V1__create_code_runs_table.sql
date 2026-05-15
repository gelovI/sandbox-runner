CREATE TABLE code_runs (
                           id UUID PRIMARY KEY,
                           language VARCHAR(50) NOT NULL,
                           code TEXT NOT NULL,
                           status VARCHAR(30) NOT NULL,
                           stdout TEXT NOT NULL,
                           stderr TEXT NOT NULL,
                           exit_code INTEGER,
                           duration_ms BIGINT NOT NULL,
                           created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);