- docker-compose up

- curl -X POST http://localhost:4318/v1/metrics -H "Content-Type: application/json" --data-binary @test-otlp-metric.json
