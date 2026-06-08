import { ChevronDownIcon } from "lucide-react";

import { formatSlug } from "@/lib/doctors-data";

export function DoctorsSeoContent({ city, speciality }: { city: string; speciality: string }) {
  const cityName = formatSlug(city);
  const specName = formatSlug(speciality);
  const lowerSpec = specName.toLowerCase();

  return (
    <section className="bg-white border border-[var(--color-paleblue)] rounded-lg p-5 md:p-7 space-y-6">
      <Block title={`About ${specName}`}>
        <p>
          Find verified {lowerSpec}s in {cityName} for consultations covering routine
          check-ups and common childhood concerns such as fever, stomach issues, allergies,
          nutrition and vaccinations. Book an in-clinic visit or a secure online video
          consultation with a doctor whose qualifications, experience and reviews suit your
          needs.
        </p>
      </Block>

      <Block title={`Who is a ${lowerSpec}?`}>
        <p>
          A {lowerSpec} is a child specialist who looks after the health, growth and
          development of infants, children and adolescents up to 18 years of age. They
          diagnose and treat illnesses, track developmental milestones, manage chronic
          conditions and advise families on preventive care.
        </p>
      </Block>

      <Block title={`Services offered by a ${lowerSpec}`}>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Well-child check-ups:</strong> routine physical exams to monitor growth and development.</li>
          <li><strong>Vaccinations:</strong> age-appropriate immunisation schedules for newborns and children.</li>
          <li><strong>Diagnosis & treatment:</strong> care for respiratory, digestive, skin and other common conditions.</li>
          <li><strong>Chronic illness management:</strong> ongoing care for asthma, diabetes, epilepsy and similar conditions.</li>
          <li><strong>Developmental screening:</strong> assessment of motor, speech and cognitive milestones.</li>
          <li><strong>Nutrition guidance:</strong> support with breastfeeding, weaning and feeding difficulties.</li>
          <li><strong>Behavioural support:</strong> evaluation for ADHD, anxiety and developmental disorders.</li>
          <li><strong>Emergency care & referrals:</strong> coordinated treatment for urgent and complex needs.</li>
        </ul>
      </Block>

      <Block title={`Conditions a ${lowerSpec} treats`}>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Respiratory infections</strong> — cold, flu, bronchitis, pneumonia, asthma.</li>
          <li><strong>Skin conditions</strong> — eczema, rashes, allergies, fungal infections.</li>
          <li><strong>Urinary tract infections</strong> in children.</li>
          <li><strong>Childhood diseases</strong> — measles, mumps, chickenpox, hepatitis.</li>
          <li><strong>Nutritional deficiencies</strong> — anaemia and vitamin deficiencies.</li>
          <li><strong>Endocrine disorders</strong> — diabetes, growth and thyroid problems.</li>
          <li><strong>Neurological conditions</strong> — epilepsy, ADHD, developmental delays.</li>
        </ul>
      </Block>

      <Block title="Common childhood illnesses in Pakistan">
        <div className="overflow-hidden rounded-md border border-[var(--color-paleblue)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-mistblue)] text-[var(--color-darknavy)]">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">Condition</th>
                <th className="text-right px-3 py-2 font-semibold">Share</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Pneumonia", "63.5%"],
                ["Meningitis", "20%"],
                ["Acute Watery Diarrhea", "8.5%"],
                ["Typhoid", "4%"],
                ["Tuberculosis", "2%"],
                ["Malaria", "2%"],
              ].map(([k, v]) => (
                <tr key={k} className="border-t border-[var(--color-paleblue)]">
                  <td className="px-3 py-2 text-[var(--color-darknavy)]">{k}</td>
                  <td className="px-3 py-2 text-right font-medium">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Block>

      <Block title={`How to book an appointment with a ${lowerSpec} in ${cityName}`}>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li><strong>Check specialities:</strong> choose a doctor whose area of expertise matches your child's needs.</li>
          <li><strong>Pick location & fee:</strong> use filters to narrow down by area and consultation fee.</li>
          <li><strong>Book the appointment:</strong> enter patient name and phone number, then confirm date and time.</li>
          <li><strong>Attend on time:</strong> arrive at the clinic or join the video consultation at the scheduled slot.</li>
        </ol>
      </Block>

      <div>
        <h2 className="text-lg md:text-xl font-bold text-[var(--color-darknavy)] mb-3">
          Frequently Asked Questions about Best {specName}s in {cityName}
        </h2>
        <div>
          {[
            {
              q: `Which symptoms and issues are treated by ${specName}s in ${cityName}?`,
              a: `${specName} specialists in ${cityName} provide the best services and treat issues like Complete Vaccination, Detailed Newborn Examine, Emergency Treatment, Management Of Pediatric Illness, Nutrition Assessment, Short Stature.`,
            },
            {
              q: `Who is the best ${specName} in ${cityName}?`,
              a: (
                <>
                  <p>Following are the best {specName}s in {cityName}:</p>
                  <ol className="list-decimal pl-5 mt-2 space-y-1">
                    <li>Asst. Prof. Dr. Muhammad Zafar Iqbal</li>
                    <li>Dr. Faiza Kaifee</li>
                    <li>Prof. Dr. Brig R Lutfullah Goheer</li>
                    <li>Prof. Dr. Shabir Ahmad</li>
                    <li>Dr. Muhammad Shoaib Rasool</li>
                  </ol>
                </>
              ),
            },
            {
              q: `How to book an appointment with the best doctor in ${cityName}?`,
              a: (
                <>
                  You can book an appointment online by visiting the doctor&apos;s profile, or call our{" "}
                  <strong>Marham helpline: 03111222398</strong> to book your appointment.
                </>
              ),
            },
            {
              q: `How to choose a best child specialist in ${cityName}?`,
              a: `You can choose the best child specialist based on their experience, patient reviews, services, qualification, and locations.`,
            },
            {
              q: `How much does a ${specName} cost in ${cityName}?`,
              a: `The fee of a ${specName} in ${cityName} ranges from PKR 500 to PKR 4000.`,
            },
            {
              q: `Who is the top paediatrician in ${cityName} 2026?`,
              a: (
                <>
                  <p>The following are the top paediatrician in {cityName}:</p>
                  <ol className="list-decimal pl-5 mt-2 space-y-1">
                    <li>Asst. Prof. Dr. Binish Ali</li>
                    <li>Dr. Tariq Rafiq Khan</li>
                    <li>Prof. Dr. Muhammad Khalid Masood</li>
                    <li>Prof. Dr. Shabir Ahmad</li>
                    <li>Prof. Dr. Muhammad Rafique</li>
                    <li>Dr. Shahzad Khurram</li>
                    <li>Dr. Shahid Aslam</li>
                    <li>Dr. Mazhar Abbas Butt</li>
                    <li>Assoc. Prof. Dr. Muhammad Sajid</li>
                    <li>Asst. Prof. Dr. Muhammad Zafar Iqbal</li>
                  </ol>
                </>
              ),
            },
            {
              q: `How can I find a ${specName} near me in ${cityName}?`,
              a: `You can find the best ${specName} near you in ${cityName} using the "Doctors Near Me" filter. It will show you the nearest ${specName}s as per your location.`,
            },
          ].map((f, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer list-none bg-[var(--color-washblue)] px-4 py-3 text-sm text-black flex justify-between items-center gap-3 [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDownIcon className="size-4 shrink-0 text-black/60 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="bg-white px-4 py-3 text-sm text-black leading-relaxed">{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg md:text-xl font-bold text-[var(--color-darknavy)] mb-2">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </div>
  );
}
