import React, { useState } from "react";
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";

const CaseVisualizer = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [caseData, setCaseData] = useState(null);
  const [error, setError] = useState("");

  const sampleData = {
    saksnummer: "4LDRRYo",
    sakStatus: "UTREDES",
    behandlingReferanse: "ca0a378d-9249-47b3-808a-afe6a6357ac5",
    relatertBehandling: null,
    behandlingOpprettetTidspunkt: "2025-09-24T12:36:56.235",
    mottattTid: "2025-09-24T00:00:00",
    behandlingStatus: "UTREDES",
    behandlingType: "Førstegangsbehandling",
    soknadsFormat: "DIGITAL",
    ident: "01410022806",
    versjon: "LATEST-TEST",
    vurderingsbehov: ["SØKNAD"],
    årsakTilOpprettelse: "SØKNAD",
    avklaringsbehov: [
      {
        avklaringsbehovDefinisjon: {
          kode: "5003",
          type: "MANUELT_PÅKREVD",
          løsesISteg: "AVKLAR_SYKDOM",
          kreverToTrinn: true,
          kvalitetssikres: true,
          løsesAv: ["SAKSBEHANDLER_OPPFOLGING"],
        },
        status: "SENDT_TILBAKE_FRA_BESLUTTER",
        endringer: [
          {
            status: "OPPRETTET",
            tidsstempel: "2025-09-24T12:36:56.584",
            frist: null,
            endretAv: "Kelvin",
            årsakTilSattPåVent: null,
            årsakTilRetur: [],
            begrunnelse: "",
          },
          {
            status: "AVSLUTTET",
            tidsstempel: "2025-09-24T12:37:50.029",
            frist: null,
            endretAv: "VEILEDER",
            årsakTilSattPåVent: null,
            årsakTilRetur: [],
            begrunnelse: "Vurdering av § 11-5",
          },
          {
            status: "KVALITETSSIKRET",
            tidsstempel: "2025-09-24T12:39:00.206",
            frist: null,
            endretAv: "VEILEDER",
            årsakTilSattPåVent: null,
            årsakTilRetur: [],
            begrunnelse: "",
          },
          {
            status: "SENDT_TILBAKE_FRA_BESLUTTER",
            tidsstempel: "2025-09-24T13:41:38.352",
            frist: null,
            endretAv: "VEILEDER",
            årsakTilSattPåVent: null,
            årsakTilRetur: [{ årsak: "MANGLENDE_UTREDNING" }],
            begrunnelse: "sdsasdasd",
          },
        ],
      },
    ],
    hendelsesTidspunkt: "2025-09-24T13:41:39.258439",
    avsluttetBehandling: null,
    identerForSak: ["01410022806"],
  };

  const handleLoadSample = () => {
    setCaseData(sampleData);
    setJsonInput(JSON.stringify(sampleData, null, 2));
    setError("");
  };

  const handleParse = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setCaseData(parsed);
      setError("");
    } catch (e) {
      setError("Invalid JSON: " + e.message);
      setCaseData(null);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("no-NO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      OPPRETTET: "bg-blue-100 text-blue-800 border-blue-300",
      AVSLUTTET: "bg-green-100 text-green-800 border-green-300",
      KVALITETSSIKRET: "bg-purple-100 text-purple-800 border-purple-300",
      SENDT_TILBAKE_FRA_BESLUTTER:
        "bg-orange-100 text-orange-800 border-orange-300",
      AVBRUTT: "bg-gray-100 text-gray-800 border-gray-300",
      UTREDES: "bg-yellow-100 text-yellow-800 border-yellow-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "AVSLUTTET":
        return <CheckCircle className="w-4 h-4" />;
      case "SENDT_TILBAKE_FRA_BESLUTTER":
        return <ArrowLeft className="w-4 h-4" />;
      case "AVBRUTT":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-gray-600 mb-6">
              Paste your JSON data below or load the sample data
            </p>

            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste JSON here..."
              className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleParse}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Parse JSON
              </button>
              <button
                onClick={handleLoadSample}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Load Sample Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setCaseData(null)}
          className="mb-6 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors shadow flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Input
        </button>

        {/* Case Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Sak #{caseData.saksnummer}
              </h1>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(caseData.sakStatus)}`}
              >
                {getStatusIcon(caseData.sakStatus)}
                {caseData.sakStatus}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div>
                <div className="text-xs text-gray-500">Opprettet</div>
                <div className="text-sm font-semibold">
                  {formatDateTime(caseData.behandlingOpprettetTidspunkt)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
              <div>
                <div className="text-xs text-gray-500">Behandlingstype</div>
                <div className="text-sm font-semibold">
                  {caseData.behandlingType}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
              <div>
                <div className="text-xs text-gray-500">Søknadsformat</div>
                <div className="text-sm font-semibold">
                  {caseData.soknadsFormat}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clarification Needs */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Avklaringsbehov
          </h2>

          {caseData.avklaringsbehov.map((behov, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {behov.avklaringsbehovDefinisjon.løsesISteg.replace(
                      /_/g,
                      " ",
                    )}
                  </h3>
                  <div className="text-sm text-gray-600">
                    Kode: {behov.avklaringsbehovDefinisjon.kode}
                  </div>
                </div>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(behov.status)}`}
                >
                  {getStatusIcon(behov.status)}
                  {behov.status}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-xs text-gray-500">Type</div>
                  <div className="text-sm font-medium">
                    {behov.avklaringsbehovDefinisjon.type}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">To trinn</div>
                  <div className="text-sm font-medium">
                    {behov.avklaringsbehovDefinisjon.kreverToTrinn
                      ? "Ja"
                      : "Nei"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Kvalitetssikres</div>
                  <div className="text-sm font-medium">
                    {behov.avklaringsbehovDefinisjon.kvalitetssikres
                      ? "Ja"
                      : "Nei"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Løses av</div>
                  <div className="text-sm font-medium">
                    {behov.avklaringsbehovDefinisjon.løsesAv[0]}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Historikk
                </h4>
                <div className="space-y-3">
                  {behov.endringer.map((endring, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStatusColor(endring.status)}`}
                        >
                          {getStatusIcon(endring.status)}
                        </div>
                        {idx < behov.endringer.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-300 my-1"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(endring.status)}`}
                          >
                            {endring.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(endring.tidsstempel)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Endret av:</span>{" "}
                          {endring.endretAv}
                        </div>
                        {endring.begrunnelse && (
                          <div className="text-sm text-gray-700 mt-1 bg-gray-50 p-2 rounded">
                            {endring.begrunnelse}
                          </div>
                        )}
                        {endring.årsakTilRetur &&
                          endring.årsakTilRetur.length > 0 && (
                            <div className="text-sm text-orange-700 mt-1 bg-orange-50 p-2 rounded">
                              <span className="font-medium">
                                Årsak til retur:
                              </span>{" "}
                              {endring.årsakTilRetur[0].årsak}
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaseVisualizer;
