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
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Card className="overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="p-6 sm:p-10">
              <Image
                alt="NiWa logo"
                className="h-auto w-full max-w-[220px]"
                height={72}
                priority
                src="/niwa-logo.png"
                width={300}
              />
              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                User Data Deletion
              </p>
              <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
                Request removal instructions for data associated with NiWa.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                This page is formatted for Meta app review and provides a deletion-request flow,
                status reference, and user guidance. For this demo environment, submissions return
                a simulated confirmation only and do not remove live records.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <Card className="bg-[rgba(255,255,255,0.72)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Step 1
                  </p>
                  <p className="mt-2 text-sm leading-6">
                    Submit identifying details used in the WhatsApp Business conversation flow.
                  </p>
                </Card>
                <Card className="bg-[rgba(255,255,255,0.72)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Step 2
                  </p>
                  <p className="mt-2 text-sm leading-6">
                    Receive a request reference code and status URL for follow-up tracking.
                  </p>
                </Card>
                <Card className="bg-[rgba(255,255,255,0.72)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Step 3
                  </p>
                  <p className="mt-2 text-sm leading-6">
                    Review the response summary and keep the code for compliance records.
                  </p>
                </Card>
              </div>
            </section>

            <section className="border-t border-border bg-[rgba(23,56,49,0.05)] p-6 sm:p-10 lg:border-l lg:border-t-0">
              <div className="rounded-[28px] border border-border bg-white/90 p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Request Form
                </p>
                <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="fullName">
                      Full name
                    </label>
                    <Input
                      id="fullName"
                      placeholder="Operator or requester name"
                      value={formValues.fullName}
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, fullName: event.target.value }))
                      }
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="email">
                        Email
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

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="phoneNumber">
                        WhatsApp phone number
                      </label>
                      <Input
                        id="phoneNumber"
                        placeholder="+91 98xxxxxx10"
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="businessName">
                      Business or workspace name
                    </label>
                    <Input
                      id="businessName"
                      placeholder="NiWa demo workspace"
                      value={formValues.businessName}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          businessName: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="deletionReason">
                      Reason for request
                    </label>
                    <Textarea
                      id="deletionReason"
                      placeholder="Describe which records should be removed or reviewed."
                      value={formValues.deletionReason}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          deletionReason: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="rounded-2xl border border-dashed border-border bg-[rgba(243,237,224,0.7)] p-4 text-sm leading-6 text-muted-foreground">
                    This is a simulated deletion workflow for Meta review and QA. It returns a
                    confirmation code and status URL, but it does not erase real data from the
                    NiWa system.
                  </div>

                  <Button className="w-full" disabled={!isComplete} size="lg" type="submit">
                    Generate deletion response
                  </Button>
                </form>
              </div>
            </section>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Policy Notes
            </p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground">
              <p>
                This page is intended to serve as a public-facing data deletion instructions URL
                for the NiWa WhatsApp Business integration.
              </p>
              <p>
                Requesters should provide enough information to identify the WhatsApp account,
                conversation, or operator record involved. A reference code is then provided for
                audit and support follow-up.
              </p>
              <p>
                Meta’s app review flow expects a reachable public URL with deletion instructions or
                a callback mechanism. This page covers the instructions side of that requirement.
              </p>
            </div>
          </Card>

          <Card className="p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Response Preview
            </p>
            {response ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-[rgba(31,91,73,0.08)] p-4">
                  <p className="text-sm font-medium text-foreground">
                    Request accepted for review.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Your simulated deletion request has been logged for compliance review.
                  </p>
                </div>
                <div className="space-y-3 text-sm">
                  <p>
                    <span className="font-medium text-foreground">Confirmation code:</span>{" "}
                    {response.confirmationCode}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Status URL:</span>{" "}
                    <span className="break-all">{response.statusUrl}</span>
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Requested at:</span>{" "}
                    {new Date(response.requestedAt).toLocaleString()}
                  </p>
                  <p className="rounded-2xl border border-dashed border-border bg-[rgba(255,248,238,0.85)] p-4 leading-6 text-muted-foreground">
                    Simulated result: the account holder would normally receive confirmation after
                    identity review and data-scope validation. This demo page stops at the
                    confirmation stage.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-border bg-[rgba(255,255,255,0.72)] p-6 text-sm leading-6 text-muted-foreground">
                Submit the form to generate a sample deletion confirmation code and status URL.
              </div>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}
