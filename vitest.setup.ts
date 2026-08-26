// Unit/integration tests must never open the production realtime transport.
process.env.NEXT_PUBLIC_REALTIME_TRANSPORT = "none";
