"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";

type FakeDeletionResponse = {
  confirmationCode: string;
  statusUrl: string;
  requestedAt: string;
};

const buildFakeResponse = (): FakeDeletionResponse => {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  const confirmationCode = `NIWA-DEL-${stamp}-${random}`;

  return {
    confirmationCode,
    statusUrl: `https://niwa.easesmith.com/data-deletion?status=${confirmationCode}`,
    requestedAt: new Date().toISOString(),
  };
};

export default function DataDeletionPage() {
  const [formValues, setFormValues] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    businessName: "",
    deletionReason: "",
  });
  const [response, setResponse] = useState<FakeDeletionResponse | null>(null);

  const isComplete = useMemo(
    () =>
      formValues.fullName.trim().length > 1 &&
      formValues.email.trim().length > 4 &&
      formValues.phoneNumber.trim().length > 5,
    [formValues],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResponse(buildFakeResponse());
  };

  return (
    <main className="min-h-screen bg-[#F7F8FA] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <Card className="overflow-hidden p-0">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="p-6 sm:p-8">
              <Image
                alt="NiWa logo"
                className="h-auto w-full max-w-[180px]"
                height={60}
                priority
                src="/niwa-logo.png"
                width={240}
              />
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                User Data Deletion Request
              </h1>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground max-w-xl">
                This portal handles Meta app review compliance for data removal requests associated with the NiWa WhatsApp Business Platform.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3 text-xs">
                <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 space-y-1">
                  <p className="font-semibold text-[#176B4D]">Step 1: Details</p>
                  <p className="text-muted-foreground">Submit identifying phone number or workspace record.</p>
                </div>
                <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 space-y-1">
                  <p className="font-semibold text-[#176B4D]">Step 2: Reference</p>
                  <p className="text-muted-foreground">Receive a tracking confirmation code and status URL.</p>
                </div>
                <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 space-y-1">
                  <p className="font-semibold text-[#176B4D]">Step 3: Audit</p>
                  <p className="text-muted-foreground">Review the compliance receipt for your records.</p>
                </div>
              </div>
            </section>

            <section className="border-t border-[#E4E4E7] bg-[#FAFAFA] p-6 sm:p-8 lg:border-l lg:border-t-0">
              <div className="rounded-md border border-[#E4E4E7] bg-white p-5 shadow-subtle space-y-3">
                <h3 className="text-sm font-semibold text-foreground border-b border-[#F0F0F2] pb-2">Deletion Request Form</h3>
                <form className="space-y-3" onSubmit={handleSubmit}>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground" htmlFor="fullName">
                      Full Requester Name *
                    </label>
                    <Input
                      id="fullName"
                      placeholder="Operator or customer name"
                      value={formValues.fullName}
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, fullName: event.target.value }))
                      }
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground" htmlFor="email">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        placeholder="name@company.com"
                        type="email"
                        value={formValues.email}
                        onChange={(event) =>
                          setFormValues((current) => ({ ...current, email: event.target.value }))
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground" htmlFor="phoneNumber">
                        WhatsApp Phone Number *
                      </label>
                      <Input
                        id="phoneNumber"
                        placeholder="+919876543210"
                        value={formValues.phoneNumber}
                        onChange={(event) =>
                          setFormValues((current) => ({
                            ...current,
                            phoneNumber: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground" htmlFor="businessName">
                      Business or Workspace Name
                    </label>
                    <Input
                      id="businessName"
                      placeholder="Workspace name"
                      value={formValues.businessName}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          businessName: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground" htmlFor="deletionReason">
                      Reason for Deletion
                    </label>
                    <Textarea
                      className="min-h-16 bg-[#FAFAFA] text-xs"
                      id="deletionReason"
                      placeholder="Describe target records..."
                      value={formValues.deletionReason}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          deletionReason: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <Button className="w-full mt-2" disabled={!isComplete} size="sm" type="submit" variant="primary">
                    Generate Deletion Receipt
                  </Button>
                </form>
              </div>
            </section>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compliance Policy</h3>
            <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
              <p>
                This portal serves as the official Meta Cloud API data deletion reference page for NiWa integration.
              </p>
              <p>
                Requesters providing verified WhatsApp numbers can trigger automated thread archival and privacy scrubbing.
              </p>
            </div>
          </Card>

          <Card className="p-5 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deletion Receipt & Status</h3>
            {response ? (
              <div className="space-y-2 text-xs">
                <div className="rounded-md border border-[#C4E8DA] bg-[#EDF8F3] p-3 text-[#16803C] font-medium">
                  Request successfully logged for processing.
                </div>
                <div className="space-y-1 text-foreground">
                  <p>
                    <span className="text-muted-foreground">Confirmation Code:</span>{" "}
                    <span className="font-mono font-semibold text-[#176B4D]">{response.confirmationCode}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Status Endpoint:</span>{" "}
                    <span className="font-mono text-[11px] break-all">{response.statusUrl}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Requested At:</span>{" "}
                    <span className="font-mono text-[11px]">{new Date(response.requestedAt).toLocaleString()}</span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Complete and submit the deletion form above to view your generated confirmation payload and tracking code.
              </p>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}

