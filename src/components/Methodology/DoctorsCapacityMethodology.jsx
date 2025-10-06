export default function DoctorsCapacityMethodology() {
  return (
    <div className="space-y-6 text-sm leading-relaxed p-8 pt-2">
      {/* <section>
        <h2 className="text-xl font-semibold mb-3">
          Методология расчета мощности и дефицита врачей в поликлиниках города Алматы
        </h2>
      </section> */}

      <section>
        <h3 className="text-lg font-semibold mb-2">Цель</h3>
        <p>
          Основная цель методологии – обеспечить контроль и оптимизацию распределения государственных заказов и участков
          обслуживания в поликлиниках города Алматы. Также методология предусматривает визуализацию данных на карте
          города с указанием половозрастного состава населения, площади поликлиник и их мощности.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Нормативы нагрузки на врачей</h3>
        <p className="mb-2">
          В соответствии с действующими стандартами, расчет мощности поликлиники осуществляется исходя из нормативной
          нагрузки на одного врача:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Врач общей практики (ВОП): до 1 700 человек (смешанное население);</li>
          <li>Участковый терапевт: до 2 200 взрослых;</li>
          <li>Участковый педиатр: до 900 детей.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Формулы расчетов</h3>

        <ol className="list-decimal pl-6 space-y-4">
          <li>
            <strong>Мощность поликлиники:</strong>
            <pre className="bg-gray-100 p-2 rounded-md mt-2 overflow-x-auto">
{`M = Σ (Nᵢ × Kᵢ)`}</pre>
            <p className="mt-2">
              где: <br />
              Nᵢ – количество врачей по специальности i; <br />
              Kᵢ – нормативная нагрузка на одного врача по специальности i. <br />
              <br />
              для врача общей практики: K<sub>ВОП</sub> = a; <br />
              для участкового терапевта: K<sub>Терапевт</sub> = b; <br />
              для участкового педиатра: K<sub>Педиатр</sub> = c.
            </p>
          </li>

          <li>
            <strong>Загруженность:</strong>
            <pre className="bg-gray-100 p-2 rounded-md mt-2 overflow-x-auto">
{`Z = F / M`}</pre>
            <p className="mt-2">
              где: <br />
              M – расчетная мощность поликлиники; <br />
              F – фактическое прикрепленное население.
            </p>
          </li>

          <li>
            <strong>Дефицит врачей (в пересчете на ВОП):</strong>
            <pre className="bg-gray-100 p-2 rounded-md mt-2 overflow-x-auto">
{`D = (F - M) / KВОП`}</pre>
            <p className="mt-2">
              где результат показывает, сколько врачей общей практики эквивалентно необходимо дополнительно для покрытия
              дефицита.
            </p>
          </li>
        </ol>
      </section>
    </div>
  );
}
