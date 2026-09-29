"use client";

import React from "react";

const DEPARTMENTS = [
  "Agent infrastructure",
  "LLM pipelines",
  "Data engineering",
  "Full-stack development",
  "Cloud & DevOps",
  "Workflow automation",
  "AI Integration Engineer",
];

export default function CareersSection() {
  return (
    <section className="layout-grid tablet:gap-y-20 laptop:gap-y-28 gap-y-12 py-[9.6rem] tablet:py-[11.2rem] laptop:py-[20rem] relative z-10 overflow-visible">
      {/* Centered Heading with Pill Fan Tags - direct grid child */}
      <h2 className="text-heading-1 laptop:max-w-[84rem] tablet:max-w-[52rem] col-span-full max-w-[40rem] place-self-center text-center text-balance leading-[1.3] tablet:leading-[1.3] laptop:leading-[1.4]">
        <span role="text" aria-label="Hands on with code every day">
          {/* Tag: Hands on */}
          <span className="grid-pile-inline h-[var(--tag-height)] overflow-hidden rounded-full align-middle whitespace-nowrap">
            <span className="bg-[#dbd7ca] dark:bg-[#11282d] rounded-full tag-base-reveal" />
            <span
              className="tag-fan-layer rounded-full bg-[#299093]"
              style={{ "--index": 0, "--delay": "0s" } as React.CSSProperties}
            />
            <span
              className="tag-fan-layer rounded-full bg-[#ef6156]"
              style={{ "--index": 1, "--delay": "0s" } as React.CSSProperties}
            />
            <span
              className="tag-fan-layer rounded-full bg-[#ffbd00] flex h-full items-center px-[var(--tag-padding-inline)] text-black font-bold leading-[var(--tag-height)]"
              style={{ "--index": 2, "--delay": "0s" } as React.CSSProperties}
            >
              Hands on
            </span>
          </span>
          {" "}
          <span className="headline-word" style={{ "--delay": "0.2s" } as React.CSSProperties}>
            with
          </span>
          {" "}
          <span className="headline-word" style={{ "--delay": "0.35s" } as React.CSSProperties}>
            code
          </span>
          {" "}
          {/* Tag: every day */}
          <span className="grid-pile-inline h-[var(--tag-height)] overflow-hidden rounded-full align-middle whitespace-nowrap">
            <span className="bg-[#dbd7ca] dark:bg-[#11282d] rounded-full tag-base-reveal" />
            <span
              className="tag-fan-layer rounded-full bg-[#ffbd00]"
              style={{ "--index": 0, "--delay": "0.5s" } as React.CSSProperties}
            />
            <span
              className="tag-fan-layer rounded-full bg-[#299093]"
              style={{ "--index": 1, "--delay": "0.5s" } as React.CSSProperties}
            />
            <span
              className="tag-fan-layer rounded-full bg-[#061a1e] flex h-full items-center px-[var(--tag-padding-inline)] text-white font-bold leading-[var(--tag-height)]"
              style={{ "--index": 2, "--delay": "0.5s" } as React.CSSProperties}
            >
              every day
            </span>
          </span>
        </span>
      </h2>

      {/* Flagship Card */}
      <div className="tablet:col-span-12 desktop:col-span-10 desktop:col-start-2 tablet:gap-12 tablet:p-16 laptop:flex-row laptop:gap-32 rounded-[4rem] desktop:rounded-[7.2rem] col-span-6 col-start-1 flex flex-col gap-8 border border-black bg-white px-8 py-12 text-[#061a1e]">
        {/* Left Subhead */}
        <h3 className="text-heading-3 laptop:flex-1 text-[#061a1e]">
          What I automate today becomes tomorrow&apos;s &apos;wait, we used to do that by hand?&apos;
        </h3>

        {/* Right Content & Roles */}
        <div className="tablet:gap-8 laptop:gap-12 laptop:flex-1 flex flex-col gap-12">
          <div className="tablet:gap-6 laptop:gap-8 flex flex-col gap-8">
            <div className="text-paragraph-large text-[#061a1e]">
              <p>
                I believe the hardest problems in automation get solved by staying hands on with the real thing, not by admiring the architecture diagram.
                <br /><br />
                I work like a solo builder with the range of a small team: full-stack, ML, and infra, all in one person and one very tired keyboard. Reach out if you value ownership, quick iteration, and systems that just run.
              </p>
            </div>

            {/* Department Chips */}
            <ul className="flex flex-wrap gap-1">
              {DEPARTMENTS.map((dept) => (
                <li key={dept}>
                  <span className="text-chip bg-[#dbd7ca] tablet:h-8 tablet:px-3 flex h-7 items-center rounded-full px-2.5 whitespace-nowrap text-[#061a1e]">
                    {dept}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button */}
          <div>
            <a
              href="https://nacreous-one.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group grid-pile text-button bg-[#299093] h-10 w-fit cursor-pointer items-center overflow-clip rounded-full text-white"
            >
              <span
                className="pointer-events-none size-full -translate-x-full rounded-[inherit] transition-transform duration-600 ease-in-out group-hover:translate-x-0 bg-[#ef6156]"
                aria-hidden="true"
              />
              <span
                className="pointer-events-none size-full -translate-x-full rounded-[inherit] transition-transform duration-600 ease-in-out group-hover:translate-x-0 bg-[#ffbd00] delay-[50ms]"
                aria-hidden="true"
              />
              <span
                className="pointer-events-none size-full -translate-x-full rounded-[inherit] transition-transform duration-600 ease-in-out group-hover:translate-x-0 bg-[#061a1e] delay-[120ms]"
                aria-hidden="true"
              />
              <span className="relative justify-self-center px-4">
                See my work
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
