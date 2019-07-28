#!/bin/sh
export VCAP_SERVICES='{"logging-amqp":{"credentials":{"uri":"amqp://localhost"},"exchange":"logging-exchange","exchangeType":"topic","routingKey":""}}'