# Event-Driven Patterns with Kafka

Implementing robust event-driven architectures using Apache Kafka.


## The Log

Kafka is a distributed commit log. Unlike a message queue (RabbitMQ), messages persist. This enables:

1. **Event Sourcing**: Replay history.
2. **Fan-out**: Multiple services read the same "OrderCreated" event independently.

### Consumer Groups

Key to scaling. If you have 10 partitions and start 10 instances of your consumer service, Kafka automatically assigns one partition to each instance.

```java
properties.put(ConsumerConfig.GROUP_ID_CONFIG, "inventory-service");
// This service will now share load with other inventory-service instances
```


## Conclusion

I hope this gives you a better understanding of Kafka. If you enjoyed this post, check out the other articles in this series!
