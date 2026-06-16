import { ChevronDownIcon } from "lucide-react";



import { buildListingFaqs } from "@/lib/seo/faq-from-listing";

import type { ListingSeoContext } from "@/lib/seo/listing-seo-context";

import { getSpecialitySeoConfig } from "@/lib/seo/speciality-seo-config";



type DoctorsSeoContentProps = {

  context: ListingSeoContext;

};



export function DoctorsSeoContent({ context }: DoctorsSeoContentProps) {

  const config = getSpecialitySeoConfig(context.specialitySlug);

  const faqs = buildListingFaqs(context);

  const isPediatrician = context.specialitySlug === "pediatrician";

  const secondary = config.secondaryKeyword.toLowerCase();



  return (

    <section className="bg-white mb-10 space-y-6">

      {isPediatrician ? (

        <>

          <Block title={`About ${config.displayName}`}>

            <p>

              Marham enlists the best pediatricians in {context.cityName} to diagnose and treat diseases in

              children. Book an appointment with the {context.year} best child specialist in {context.cityName}{" "}

              to get treatment for issues like Stomach Flu, chickenpox, common colds, childhood diabetes,

              mumps, and malnutrition.

            </p>

          </Block>



          <Block title="Who is a pediatrician?">

            <p>

              A pediatrician is a child specialist who monitors children&apos;s ongoing health, diagnoses

              diseases and provides the necessary treatments. Pediatric doctors focus on the mental, physical,

              and behavioral well-being of children up to 18 years of age.

            </p>

            <p>

              Our platform helps you to consult the best pediatrician in {context.cityName} to provide

              specialized medical care and assistance to the children. You can also consult the child doctor

              online through Marham to discuss your concerns.

            </p>

          </Block>



          <Block title="What services are offered by a Pediatrician?">

            <p>

              A pediatric specialist offers comprehensive services to ensure children&apos;s well-being and

              proper healthcare. These services include:

            </p>

            <ul className="list-disc pl-5 space-y-2 mt-2">

              <li>

                <strong>Well-child check-ups:</strong> Regular physical examinations to monitor children&apos;s

                growth, development, and overall health. The pediatrician also guides the parents regarding the

                effects of breastmilk on children, along with general counseling about the child&apos;s health.

              </li>

              <li>

                <strong>Vaccinations:</strong> Consult the best child specialist in {context.cityName} to get a

                vaccination schedule for your newborns. They guide on administering age-appropriate vaccines to

                protect children from various diseases.

              </li>

              <li>

                <strong>Diagnosis and treatment:</strong> Expert evaluation, diagnosis, and treatment of common

                and complex pediatric conditions are also among the major services provided by a pediatrician. The

                major diseases that a child specialist treats include respiratory infections, gastrointestinal

                disorders, teeth problems, allergies, skin conditions, and more.

              </li>

              <li>

                <strong>Management of chronic illnesses:</strong> Providing specialized care for children with

                chronic conditions such as asthma, diabetes, epilepsy, and other long-term health issues.

              </li>

              <li>

                <strong>Developmental screenings:</strong> Assessing developmental milestones and identifying

                potential delays or concerns in motor skills, speech, language, or cognitive development.

              </li>

              <li>

                <strong>Nutrition guidance:</strong> The pediatrician offers expert advice on proper nutrition,

                breastfeeding support, the introduction of solid foods, and addressing feeding difficulties.

              </li>

              <li>

                <strong>Behavioral and psychological support:</strong> Evaluating and addressing behavioral and

                mental health concerns in children, including ADHD, anxiety, depression, and developmental

                disorders.

              </li>

              <li>

                <strong>Emergency care:</strong> Providing immediate medical attention and treatment for pediatric

                emergencies, including accidents, injuries, and acute illnesses.

              </li>

              <li>

                <strong>Referrals and coordination of care:</strong> Collaborating with other specialists and

                healthcare providers as needed and ensuring comprehensive care for children with complex medical

                needs.

              </li>

              <li>

                <strong>Parental education and counseling:</strong> Offering guidance, support, and education to

                parents on various aspects of child health, growth, development, preventive care, and parenting

                strategies.

              </li>

            </ul>

            <p>

              By delivering these services, the child specialist in {context.cityName} ensures that children

              receive the highest medical care and support for their overall well-being and healthy development.

            </p>

          </Block>



          <Block title="What are the conditions that a pediatrician treats?">

            <p>

              A child specialist, also known as a pediatrician, diagnose, treat, and manage various diseases and

              conditions that affect children. Some of the common diseases treated by a child specialist in{" "}

              {context.cityName} include:

            </p>

            <div className="space-y-2 mt-2">

              <p>

                <strong>Respiratory infections:</strong> This encompasses common ailments such as the common

                cold, flu, bronchitis, pneumonia, and asthma. These infections affect the respiratory system of

                the children.

              </p>

              <p>

                <strong>Skin conditions:</strong> Child specialists manage various dermatological concerns in

                children. These skin issues include eczema, rashes, allergies, fungal infections, and acne,

                promoting healthy skin.

              </p>

              <p>

                <strong>Urinary tract infections (UTIs):</strong> The infections affecting the kidneys, bladder,

                or urethra in children are effectively treated by the pediatrician.

              </p>

              <p>

                <strong>Childhood diseases:</strong> The doctorprovides vaccination against preventable diseases

                in children. These diseases include measles, mumps, rubella, chickenpox, polio, hepatitis, and

                meningitis.

              </p>

              <p>

                <strong>Nutritional deficiencies:</strong> The doctor address nutritional concerns and

                deficiencies in children. The common conditions of pediatrician concern include; iron deficiency

                anemia, vitamin deficiencies, and malnutrition, promoting healthy growth and development.

              </p>

              <p>

                <strong>Endocrine disorders:</strong> Pediatricians diagnose and manage endocrine disorders like

                diabetes, growth disorders, thyroid disorders, and adrenal gland disorders that can affect a

                child&apos;s hormone balance and overall health.

              </p>

              <p>

                <strong>Childhood cancers:</strong> Pediatric oncologists, who specialize in treating childhood

                cancers, work closely with child specialists to diagnose and provide appropriate treatment for

                various types of cancers, such as leukaemia, lymphoma, and brain tumors.

              </p>

              <p>

                <strong>Genetic disorders:</strong> Pediatricians are trained to identify and manage genetic

                disorders caused by inherited mutations, including conditions like Down syndrome, cystic

                fibrosis, and sickle cell anemia.

              </p>

              <p>

                <strong>Neurological diseases:</strong> Doctor addresses neurological conditions like epilepsy,

                cerebral palsy, developmental delays, attention-deficit/hyperactivity disorder (ADHD), and

                autism spectrum disorders. They also provide specialised care to improve a child&apos;s

                neurological well-being.

              </p>

              <p>

                <strong>Infectious diseases:</strong> Pediatricians diagnose and treat infectious diseases commonly

                seen in children, including chickenpox, measles, rubella, tuberculosis, meningitis, and

                hepatitis, safeguarding the health of young patients.

              </p>

            </div>

            <p>

              A pediatrician is skilled in managing various diseases and conditions that affect children. They

              provide comprehensive care to ensure the health and well-being of their young patients.

            </p>

          </Block>



          <Block title="What are the prevalent childhood illnesses in Pakistan?">

            <p>Some of the common diseases affecting children in Pakistan are;</p>

            <div className="overflow-hidden rounded-xs">

              <table className="w-full text-sm mt-4">

                <thead className="bg-[var(--color-mistblue)] text-[var(--color-darknavy)]">

                  <tr>

                    <th className="text-left px-3 py-2 font-semibold">Illness</th>

                    <th className="text-right px-3 py-2 font-semibold">

                      Prevalence among sick children

                    </th>

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

                  ].map(([condition, share]) => (

                    <tr key={condition} className="border-t border-[var(--color-paleblue)]">

                      <td className="px-3 py-2 text-[var(--color-darknavy)]">{condition}</td>

                      <td className="px-3 py-2 text-right font-medium">{share}</td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </Block>



          <Block title={`How to book an appointment with a child specialist in ${context.cityName}?`}>

            <p>

              To book an appointment with the best child specialist in {context.cityName}, follow the given

              steps;

            </p>

            <div className="space-y-2 mt-2">

              <p>

                <strong>Check specialities:</strong> Pediatricians at Marham have extensive experience and

                expertise in pediatric medicine. They are professor doctors with FCPS and other post-graduate

                degrees. Choose a pediatric doctor specialising in the type of treatment you need for your child

                or infant.

              </p>

              <p>

                <strong>Choose Location and Fee:</strong> Use the filters to choose the location and fee

                according to your ease. The top pediatricians practice at various locations in {context.cityName}{" "}

                and have affordable fees.

              </p>

              <p>

                <strong>Appointment with a pediatrician:</strong> Book an appointment with the best doctor

                through Marham. Enter the patient&apos;s name and phone number and confirm the appointment date,

                time, and location with the pediatrician. Marham confirms the appointment with the doctor of your

                choice and also sends reminders on the appointment day.

              </p>

              <p>

                <strong>Attend the appointment:</strong> Arrive on time on the appointment day. Discuss your

                concerns and questions with the top pediatric doctor, and follow their instructions regarding any

                follow-up appointments or treatments.

              </p>

            </div>

            <p>

              Following these steps, you can consult the best pediatrician in {context.cityName} to cater to your

              child&apos;s healthcare needs. Leave a patient satisfaction score per your experience to help other

              patients decide about consulting the best doctor.

            </p>

          </Block>

        </>

      ) : (

        <>

          <Block title={`About ${config.displayName}`}>

            <p>

              Marham enlists the best {config.displayName.toLowerCase()}s in {context.cityName} to help patients

              find trusted healthcare. Book an appointment with the {context.year} best {secondary} in{" "}

              {context.cityName} for expert consultation and treatment.

            </p>

          </Block>



          <Block title={`How to book an appointment with a ${config.displayName.toLowerCase()} in ${context.cityName}?`}>

            <p>

              Browse verified {config.displayName.toLowerCase()}s on Marham, compare fees and locations, book

              online or call our helpline at 03111222398 for assistance.

            </p>

          </Block>

        </>

      )}



      <Block title={`Frequently Asked Questions about Best ${config.displayName}s in ${context.cityName}`}>

        <div className="space-y-1">

          {faqs.map((faq) => (

            <FaqDetails key={faq.question} question={faq.question} answer={faq.answer} doctors={context.doctors} />

          ))}

        </div>

      </Block>

    </section>

  );

}



function FaqDetails({

  question,

  answer,

  doctors,

}: {

  question: string;

  answer: string;

  doctors: ListingSeoContext["doctors"];

}) {

  const isDoctorListFaq =

    question.includes("Who is the best") || question.includes("Who is the top");

  const listCount = question.includes("top paediatrician") ? 10 : 5;

  const listDoctors = isDoctorListFaq ? doctors.slice(0, listCount) : [];



  return (

    <details className="group bg-base">

      <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-900">

        {question}

        <ChevronDownIcon className="size-4 shrink-0 text-slate-600 transition-transform duration-200 group-open:rotate-180" />

      </summary>

      <div className="bg-white px-4 pb-4 text-sm text-black">

        {isDoctorListFaq && listDoctors.length > 0 ? (

          <>

            {answer.split("\n")[0]}

            <ol className="list-decimal pl-5 pt-2 space-y-1 text-black">

              {listDoctors.map((d) => (

                <li key={d.id}>{d.name}</li>

              ))}

            </ol>

          </>

        ) : question.includes("book an appointment") || answer.includes("03111222398") ? (

          <>

            You can book an appointment online by visiting the doctor&apos;s profile, or call our{" "}

            <strong>Marham helpline: 03111222398</strong> to book your appointment.

          </>

        ) : question.includes("How to choose a best child specialist") ? (

          <>

            You can choose the best child specialist based on their <strong>experience</strong>,{" "}

            <strong>patient reviews</strong>, <strong>services</strong>, <strong>qualification</strong>, and{" "}

            <strong>locations</strong>.

          </>

        ) : (

          answer.split("\n").map((line, i) => <p key={i} className={i > 0 ? "mt-1" : undefined}>{line}</p>)

        )}

      </div>

    </details>

  );

}



function Block({ title, children }: { title: string; children: React.ReactNode }) {

  return (

    <article>

      <h2 className="text-md md:text-[17px] font-bold text-black mb-3">{title}</h2>

      <div className="text-sm text-black leading-relaxed space-y-2">{children}</div>

    </article>

  );

}


