"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CreditCard,
  Loader2,
  Zap,
  Crown,
  Building2,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { API } from "@/lib/constants/api";
import { getApiErrorMessage } from "@/lib/api-client";
import PageLoader from "@/app/components/ui/PageLoader";
import { useTechnician } from "@/app/providers/TechnicianProvider";
import { useProgress } from "@/app/providers/ProgressProvider";
import type { PlanDetails } from "@/lib/types/subscription";
import { SUBSCRIPTION_PLANS } from "@/lib/constants/subscription";
import { isDemoMode } from "@/lib/demo";
import { ONBOARDING_BARBER_ACCOUNT } from "@/lib/auth";

/** Plan shape from GET plans/list?provider=stripe - use data.price_id, not stripe_price.id */
interface ApiPlan {
  id: string;
  price_id?: string;
  data?: { price_id?: string };
  stripe_price?: { id?: string };
  [key: string]: unknown;
}

/** Map API plan ids to our static plan ids */
const API_PLAN_TO_STATIC: Record<string, string> = {
  INDEPENDENT: "independent",
  PROFESSIONAL: "professional",
  SHOP_OWNER: "shop-owner",
};

export default function OnboardingChoosePlanPage() {
  const router = useRouter();
  const { technician, isTechnicianLoading, refetchTechnician } =
    useTechnician();
  const { progress, isProgressLoading, refetchProgress } = useProgress();
  const [plans, setPlans] = useState<PlanDetails[]>(SUBSCRIPTION_PLANS);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [subscribingPlanId, setSubscribingPlanId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState("");
  const [didRefetchTechnician, setDidRefetchTechnician] = useState(false);

  const technicianId = technician?.id ?? technician?.technician_id;

  // Page-level progress check: if already subscribed, go to contacts; else must be technician to be here
  useEffect(() => {
    if (isDemoMode()) return;
    if (isProgressLoading || progress == null) return;
    if (progress.has_subscribed === true) {
      router.replace("/contacts");
      return;
    }
    if (progress.is_technician !== true) {
      router.replace(ONBOARDING_BARBER_ACCOUNT);
    }
  }, [progress, isProgressLoading, router]);

  // If backend says user is technician but we don't have technician profile yet, refetch once (handles race after barber onboarding or different response shape)
  useEffect(() => {
    if (isDemoMode() || didRefetchTechnician) return;
    if (progress?.is_technician !== true || technicianId) return;
    if (!isTechnicianLoading) {
      setDidRefetchTechnician(true);
      refetchTechnician();
    }
  }, [
    progress?.is_technician,
    technicianId,
    isTechnicianLoading,
    didRefetchTechnician,
    refetchTechnician,
  ]);

  useEffect(() => {
    if (isDemoMode()) {
      setPlans(SUBSCRIPTION_PLANS);
      setIsLoadingPlans(false);
      return;
    }
    let cancelled = false;
    async function fetchPlans() {
      setIsLoadingPlans(true);

      // Try to load from session storage first
      const cachedPlans = sessionStorage.getItem(
        "chairfill_subscription_plans",
      );
      if (cachedPlans) {
        try {
          const parsed = JSON.parse(cachedPlans);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPlans(parsed);
            setIsLoadingPlans(false);
            return;
          }
        } catch (e) {
          console.warn("Failed to parse cached subscription plans", e);
        }
      }

      try {
        const { data } = await api.get<ApiPlan[] | { data?: ApiPlan[] }>(
          `${API.PLANS.LIST}?provider=stripe`,
        );
        const raw = Array.isArray(data)
          ? data
          : (data as { data?: ApiPlan[] })?.data;
        const apiPlans: ApiPlan[] = Array.isArray(raw) ? raw : [];
        if (cancelled) return;
        const merged: PlanDetails[] = SUBSCRIPTION_PLANS.map((p) => {
          const apiPlan = apiPlans.find((a) => {
            const apiKey = String(a.name || a.id).toUpperCase();
            const staticId = API_PLAN_TO_STATIC[apiKey] ?? p.id;
            return staticId === p.id;
          });
          const priceId = apiPlan
            ? (apiPlan.data?.price_id ?? apiPlan.price_id)
            : p.price_id;
          return {
            ...p,
            price_id: priceId ?? p.price_id,
          };
        });

        // Cache the merged result
        sessionStorage.setItem(
          "chairfill_subscription_plans",
          JSON.stringify(merged),
        );
        setPlans(merged);
      } catch {
        if (!cancelled) setPlans(SUBSCRIPTION_PLANS);
      } finally {
        if (!cancelled) setIsLoadingPlans(false);
      }
    }
    fetchPlans();
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePlanClick = async (plan: PlanDetails) => {
    if (plan.comingSoon) return;
    if (!plan.price_id) {
      setError("This plan is not available for subscription yet.");
      return;
    }
    if (!technicianId) {
      setError(
        "Technician profile not found. Please complete onboarding first.",
      );
      return;
    }
    setError("");
    setSubscribingPlanId(plan.id);
    try {
      if (isDemoMode()) {
        await new Promise((r) => setTimeout(r, 800));
        await refetchProgress();
        router.push("/contacts");
        return;
      }
      const { data } = await api.post<{
        url?: string;
        data?: { url?: string; checkoutSession?: { url?: string } };
      }>(API.SUBSCRIPTION.SUBSCRIBE, {
        price_id: plan.price_id,
        technician_id: technicianId,
      });
      const raw = data && typeof data === "object" ? data : null;
      const checkoutUrl =
        (raw && typeof (raw as { url?: string }).url === "string"
          ? (raw as { url: string }).url
          : null) ??
        (raw && (raw as { data?: { url?: string } }).data?.url) ??
        (raw &&
          (raw as { data?: { checkoutSession?: { url?: string } } }).data
            ?.checkoutSession?.url);
      if (checkoutUrl && typeof checkoutUrl === "string") {
        window.location.href = checkoutUrl;
        return;
      }
      setError(
        "No checkout URL returned. Please try again or contact support.",
      );
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubscribingPlanId(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "independent":
        return <Zap className="w-5 h-5" />;
      case "professional":
        return <Crown className="w-5 h-5" />;
      case "shop-owner":
        return <Building2 className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  // Full-page loading until progress, technician (when needed), and plans are ready
  const isPageLoading =
    isLoadingPlans ||
    (!isDemoMode() && (isProgressLoading || progress == null)) ||
    (!isDemoMode() &&
      progress?.is_technician === true &&
      !technicianId &&
      isTechnicianLoading);

  if (isPageLoading) {
    return <PageLoader message="Loading…" />;
  }

  return (
    <div className="min-h-screen bg-background pt-4 sm:pt-8 pb-8">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header – same style as subscription page */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-foreground">
                Choose your plan
              </h1>
            </div>
            <p className="text-lg text-foreground/70">
              Select a plan that fits your business. You’ll complete payment on
              the next step.
            </p>
          </div>

          {!isDemoMode() &&
            progress?.is_technician === true &&
            !technicianId &&
            !isTechnicianLoading && (
              <div className="mb-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Technician profile not found. Please complete onboarding
                  first, or try again.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    refetchTechnician();
                  }}
                  className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-300 hover:underline"
                >
                  Retry
                </button>
              </div>
            )}

          {/* Compare plans – same section/card design as subscription page */}
          <section className="mb-8" aria-labelledby="plans-heading">
            <h2
              id="plans-heading"
              className="text-2xl font-semibold text-foreground mb-2"
            >
              Compare plans
            </h2>
            <p className="text-foreground/70 mb-6">
              Choose the plan that fits your business. You can change or cancel
              anytime.
            </p>

            {isLoadingPlans ? (
              <div className="flex justify-center py-12">
                <Loader2
                  className="w-10 h-10 animate-spin text-zinc-500 dark:text-zinc-400"
                  aria-hidden
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {plans.map((plan) => {
                  const isPopular = plan.badge === "Most Popular";
                  const isComingSoon = plan.comingSoon ?? false;
                  const isSelectable = !isComingSoon && !!plan.price_id;
                  const isSubscribing = subscribingPlanId === plan.id;

                  // On mobile: show Professional first; on desktop: keep DOM order (Independent, Professional, Shop Owner)
                  const orderClass =
                    plan.id === "professional"
                      ? "order-1 lg:order-none"
                      : plan.id === "independent"
                        ? "order-2 lg:order-none"
                        : "order-3 lg:order-none";

                  return (
                    <article
                      key={plan.id}
                      role={isSelectable ? "button" : undefined}
                      tabIndex={isSelectable ? 0 : undefined}
                      onClick={() => !isComingSoon && handlePlanClick(plan)}
                      onKeyDown={(e) => {
                        if (isComingSoon) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handlePlanClick(plan);
                        }
                      }}
                      className={`relative flex flex-col rounded-3xl border-2 transition-all duration-200 ${orderClass} ${
                        isPopular
                          ? "border-primary bg-zinc-100 dark:bg-white/5 shadow-lg shadow-primary/10 lg:shadow-xl lg:shadow-primary/10"
                          : "border-border bg-card shadow-sm"
                      } ${isSelectable ? "hover:border-primary/50 hover:shadow-md cursor-pointer" : ""}`}
                    >
                      {/* Badges */}
                      <div className="flex items-start justify-between gap-2 p-5 pb-0">
                        <div className="flex flex-wrap gap-2">
                          {plan.badge === "Most Popular" && (
                            <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                              Recommended
                            </span>
                          )}
                          {plan.badge === "Coming Soon" && (
                            <span className="inline-flex items-center rounded-full bg-foreground/10 px-2.5 py-0.5 text-xs font-medium text-foreground/70">
                              Coming soon
                            </span>
                          )}
                        </div>
                        <div className="text-primary">
                          {getPlanIcon(plan.id)}
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-lg font-bold text-foreground mb-1">
                          {plan.name}
                        </h3>
                        {plan.tagline && (
                          <p className="text-sm text-foreground/70 mb-4">
                            {plan.tagline}
                          </p>
                        )}

                        <div className="mb-4">
                          {plan.price != null ? (
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-bold tracking-tight text-foreground">
                                ${plan.price}
                              </span>
                              <span className="text-foreground/70">
                                /{plan.pricePeriod}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold text-foreground">
                                Custom
                              </span>
                              <span className="text-foreground/70 text-sm">
                                — {plan.pricePeriodLabel ?? "Contact us"}
                              </span>
                            </div>
                          )}
                          {plan.subtitle && (
                            <p className="text-sm text-foreground/70 mt-1">
                              {plan.subtitle}
                            </p>
                          )}
                        </div>

                        <ul className="space-y-2.5 flex-1 mb-6" role="list">
                          {plan.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2.5 text-sm"
                            >
                              <Check
                                className="w-5 h-5 text-primary shrink-0 mt-0.5"
                                aria-hidden
                              />
                              <span className="text-foreground/80">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isComingSoon) handlePlanClick(plan);
                          }}
                          disabled={isComingSoon || isSubscribing}
                          aria-disabled={isComingSoon || isSubscribing}
                          className={`w-full py-3 px-4 rounded-full font-semibold text-sm transition-all inline-flex items-center justify-center gap-2 ${
                            isComingSoon
                              ? "bg-foreground/5 text-foreground/50 cursor-default"
                              : isPopular
                                ? "bg-primary text-primary-foreground hover:opacity-90"
                                : "bg-transparent border border-border text-foreground hover:bg-foreground/5"
                          }`}
                        >
                          {isComingSoon ? (
                            "Contact us"
                          ) : isSubscribing ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Subscribing…
                            </>
                          ) : (
                            "Subscribe"
                          )}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center mb-4">
              {error}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
