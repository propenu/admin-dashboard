import { Ban, Crown, Eye, Globe2, Link2, MapPin, Megaphone, SplitSquareHorizontal, TrendingUp, UserCheck } from "lucide-react";
import PromotionLocationCoverage from "../features/property/components/shared/PromotionLocationCoverage";
import { describeCoverage, isCoverageEmpty } from "../features/property/components/shared/promotionCoverageUtils";
import { LOCATION_RULES, MAIN_PLACEMENTS, describePlanPackage } from "../../features/builderPlans/planPackage";

const PLACEMENT_STYLE = {
  prime: { icon: Crown, active: "border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-100 ring-2 ring-amber-200", iconWrap: "bg-amber-100 text-amber-600" },
  featured: { icon: TrendingUp, active: "border-sky-400 bg-gradient-to-br from-sky-50 to-cyan-100 ring-2 ring-sky-200", iconWrap: "bg-sky-100 text-sky-600" },
  none: { icon: Ban, active: "border-slate-400 bg-slate-50 ring-2 ring-slate-200", iconWrap: "bg-slate-100 text-slate-500" },
};

const RULE_ICON = { all_india: Globe2, team_picks: UserCheck, fixed: MapPin };

function Block({ step, title, hint, children }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-4">
    <div className="mb-3 flex items-start gap-2.5">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0f3d2e] to-[#27AE60] text-[10px] font-bold text-white">{step}</span>
      <div><p className="text-[12px] font-semibold text-slate-800">{title}</p>{hint ? <p className="mt-0.5 text-[10px] leading-4 text-slate-500">{hint}</p> : null}</div>
    </div>
    {children}
  </section>;
}

function Switch({ checked, onChange, disabled }) {
  return <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${checked ? "bg-violet-600" : "bg-slate-300"} disabled:opacity-50`}>
    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
  </button>;
}

/** Plan promotion package: placement, Sponsored add-on, location rule, leads, start behaviour. */
export default function PlanPackageEditor({ value, onChange, errors = {}, disabled = false }) {
  const set = (patch) => onChange({ ...value, ...patch });
  const hasMain = value.mainPlacement !== "none";
  const mainLabel = value.mainPlacement === "prime" ? "Prime" : value.mainPlacement === "featured" ? "Top Selling" : "";
  const hasPromotion = hasMain || value.sponsoredEnabled;
  const sameList = hasMain && value.sponsoredEnabled && value.sponsoredSameAsMain;
  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] text-slate-800 outline-none transition focus:border-[#27AE60] focus:ring-2 focus:ring-emerald-100";

  return <div className="space-y-3">
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#0f3d2e] via-[#17643f] to-[#27AE60] px-4 py-3 text-white">
      <div><p className="text-[9px] uppercase tracking-[.16em] text-emerald-100/80">What the builder gets</p><p className="mt-0.5 text-[15px] font-semibold">{describePlanPackage(value)}</p></div>
      <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] ring-1 ring-white/25">{hasPromotion ? "Same start and end dates" : "Listed only, not promoted"}</span>
    </div>

    <Block step={1} title="Promotion" hint="Choose where the project is shown: Prime or Top Selling. Click again to unselect.">
      <div className="grid gap-2 sm:grid-cols-2">{MAIN_PLACEMENTS.map((option) => {
        const style = PLACEMENT_STYLE[option.value];
        const Icon = style.icon;
        const active = value.mainPlacement === option.value;
        return <button key={option.value} type="button" disabled={disabled} onClick={() => set({ mainPlacement: active ? "none" : option.value })} className={`flex items-start gap-2 rounded-xl border p-2.5 text-left transition ${active ? style.active : "border-slate-200 bg-white hover:border-slate-300"}`}>
          <span className={`rounded-lg p-1.5 ${style.iconWrap}`}><Icon size={14}/></span>
          <span className="min-w-0"><span className="block text-[12px] font-semibold text-slate-800">{option.label}</span><span className="mt-0.5 block text-[10px] leading-4 text-slate-500">{option.desc}</span></span>
        </button>;
      })}</div>
    </Block>

    <section className={`flex items-center justify-between gap-3 rounded-2xl border p-4 transition ${value.sponsoredEnabled ? "border-violet-300 bg-violet-50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-start gap-2.5">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0f3d2e] to-[#27AE60] text-[10px] font-bold text-white">2</span>
        <div>
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-800"><Megaphone size={13} className={value.sponsoredEnabled ? "text-violet-600" : "text-slate-400"}/>Sponsored promotion ad</p>
          <p className="mt-0.5 text-[10px] leading-4 text-slate-500">{value.sponsoredEnabled
            ? hasMain ? `On: shown as an ad in search results and listing pages. ${mainLabel} and the ad start and end together.` : "On: shown as an ad in search results and listing pages."
            : hasMain ? `Off: only the ${mainLabel} spot. Turn on to also show it as an ad in search results and listing pages.` : "Off: the project is only listed, not promoted."}</p>
        </div>
      </div>
      <Switch checked={value.sponsoredEnabled} onChange={(checked) => set({ sponsoredEnabled: checked })} disabled={disabled}/>
    </section>

    {hasPromotion && <Block step={3} title="Which cities" hint="Where buyers will see the project. Applies to every project on this plan.">
      <div className="grid gap-2 sm:grid-cols-2">{LOCATION_RULES.map((rule) => {
        const Icon = RULE_ICON[rule.value];
        const active = value.locationRule === rule.value;
        return <button key={rule.value} type="button" disabled={disabled} onClick={() => set({ locationRule: rule.value })} className={`flex items-start gap-2 rounded-xl border p-2.5 text-left transition ${active ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200" : "border-slate-200 bg-white hover:border-slate-300"}`}>
          <Icon size={14} className={`mt-0.5 shrink-0 ${active ? "text-emerald-700" : "text-slate-400"}`}/>
          <span><span className="block text-[12px] font-semibold text-slate-800">{rule.label}</span><span className="block text-[10px] leading-4 text-slate-500">{rule.desc}</span></span>
        </button>;
      })}</div>
      {!LOCATION_RULES.some((rule) => rule.value === value.locationRule) && <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-[10px] text-amber-800">This plan used “Project's own city”, which is no longer offered. Choose one of the options above to save it.</p>}
      {value.locationRule === "team_picks" && <p className="mt-2 rounded-xl bg-sky-50 px-3 py-2 text-[10px] text-sky-800">Even on an Automatic invoice, the first start waits until our team picks the cities once. Renewals reuse the same cities.</p>}
      {value.locationRule === "fixed" && <div className="mt-3 space-y-2">
        {hasMain && value.sponsoredEnabled && <div className="grid grid-cols-2 gap-2">
          {[{ same: true, icon: Link2, title: "Same cities for both", sub: `${mainLabel} and the ad use one list` }, { same: false, icon: SplitSquareHorizontal, title: "Different cities", sub: `One list for ${mainLabel}, one for the ad` }].map((option) => {
            const Icon = option.icon;
            const active = value.sponsoredSameAsMain === option.same;
            return <button key={option.title} type="button" disabled={disabled} onClick={() => set({ sponsoredSameAsMain: option.same })} className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-left text-[11px] font-semibold transition ${active ? "border-emerald-400 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200" : "border-slate-200 bg-white text-slate-700"}`}><Icon size={14} className="mt-0.5 shrink-0"/><span>{option.title}<span className="block text-[10px] font-normal text-slate-500">{option.sub}</span></span></button>;
          })}
        </div>}
        {hasMain && <PromotionLocationCoverage enabled value={value.mainCoverage} onChange={(map) => set({ mainCoverage: map })} title={sameList ? `Cities for ${mainLabel} and the ad` : value.sponsoredEnabled ? `① Cities for ${mainLabel}` : `Cities for ${mainLabel}`} subtitle={sameList ? "This one list is used for both." : `Where the ${mainLabel} spot is shown.`} accentClass={value.mainPlacement === "prime" ? "border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-white" : "border-sky-200 bg-gradient-to-br from-sky-50/80 via-white to-white"}/>}
        {value.sponsoredEnabled && !sameList && <PromotionLocationCoverage enabled value={value.sponsoredAd} onChange={(map) => set({ sponsoredAd: map })} title={hasMain ? "② Cities for the Sponsored ad" : "Cities for the Sponsored ad"} subtitle="Used only for the ad." accentClass="border-violet-200 bg-gradient-to-br from-violet-50/80 via-white to-white"/>}
        {sameList && !isCoverageEmpty(value.mainCoverage) && <p className="text-[10px] text-slate-500">Shown in: {describeCoverage(value.mainCoverage, 4)}</p>}
        {errors.coverage && <p className="text-[11px] text-red-600">{errors.coverage}</p>}
      </div>}
      {value.locationRule !== "fixed" && errors.coverage && <p className="mt-2 text-[11px] text-red-600">{errors.coverage}</p>}
    </Block>}

    {hasPromotion && <Block step={4} title="Buyer contacts" hint="How many buyer contacts the builder can see in full while the plan runs.">
      <label className="block sm:max-w-xs"><span className="mb-1.5 flex items-center gap-1 text-[12px] text-slate-700"><Eye size={12}/>Buyer contacts shown in full</span>
        <input disabled={disabled} type="number" min="0" step="1" className={inputClass} value={value.visibleLeadLimit} onFocus={(e) => e.target.select()} onChange={(e) => set({ visibleLeadLimit: e.target.value.replace(/^0+(?=\d)/, "") })}/>
        {errors.visibleLeadLimit ? <span className="mt-1 block text-[11px] text-red-600">{errors.visibleLeadLimit}</span> : null}
      </label>
    </Block>}
  </div>;
}
