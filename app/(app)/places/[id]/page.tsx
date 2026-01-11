"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useWebApiOptions } from "../../../_components/useWebApiOptions";
import { Modal } from "../../../_components/Modal";
import { AvailabilityCalendar, AvailabilityRange } from "./AvailabilityCalendar";
import {
  useAvailabilityQuery,
  useGuidesQuery,
  usePlaceQuery
} from "../../../../shared/query/hooks/useQueries";
import {
  useAddAvailabilityMutation,
  useDeleteAvailabilityMutation,
  useRequestBookingMutation,
  useUploadPlaceHeadlineMutation,
  useUpdateGuidesMutation,
  useUpdateRulesMutation
} from "../../../../shared/query/hooks/useMutations";

const GUIDE_LABELS = [
  { key: "access", label: "Jak się dostać" },
  { key: "sleep", label: "Jak się wyspać" },
  { key: "wash", label: "Jak się umyć" },
  { key: "eat_drink", label: "Jak się najeść/napić" },
  { key: "operate", label: "Jak obsługiwać" }
];

const MAX_HEADLINE_BYTES = 5 * 1024 * 1024;

const dayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const isBeforeDay = (left: Date, right: Date) => dayStart(left).getTime() < dayStart(right).getTime();

const isAfterDay = (left: Date, right: Date) => dayStart(left).getTime() > dayStart(right).getTime();

const formatDateLabel = (date: Date | null) =>
  date
    ? date.toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "—";

const formatDateForApi = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isRangeAvailable = (start: Date, end: Date, ranges: AvailabilityRange[]) => {
  return ranges.some((range) => {
    const rangeStart = new Date(range.startDate);
    const rangeEnd = new Date(range.endDate);
    return dayStart(start) >= dayStart(rangeStart) && dayStart(end) <= dayStart(rangeEnd);
  });
};

const isDayAvailable = (day: Date, ranges: AvailabilityRange[]) => {
  const dayValue = dayStart(day).getTime();
  return ranges.some((range) => {
    const rangeStart = dayStart(new Date(range.startDate)).getTime();
    const rangeEnd = dayStart(new Date(range.endDate)).getTime();
    return dayValue >= rangeStart && dayValue < rangeEnd;
  });
};

const getAvailabilityEndForStart = (start: Date, ranges: AvailabilityRange[]) => {
  const startValue = dayStart(start).getTime();
  const match = ranges.find((range) => {
    const rangeStart = dayStart(new Date(range.startDate)).getTime();
    const rangeEnd = dayStart(new Date(range.endDate)).getTime();
    return startValue >= rangeStart && startValue < rangeEnd;
  });
  return match ? dayStart(new Date(match.endDate)) : null;
};

const isRangeBlocked = (
  start: Date,
  end: Date,
  bookings: Array<{ startDate: string; endDate: string; status: string }>
) => {
  const normalize = (date: Date) => dayStart(date);
  const startDay = normalize(start);
  const endExclusive = normalize(end);
  return bookings.some((booking) => {
    if (booking.status !== "requested" && booking.status !== "approved") return false;
    const bookingStart = normalize(new Date(booking.startDate));
    const bookingEndExclusive = normalize(new Date(booking.endDate));
    return bookingStart < endExclusive && bookingEndExclusive > startDay;
  });
};

const isDayBlocked = (day: Date, bookings: Array<{ startDate: string; endDate: string; status: string }>) => {
  const dayStartValue = dayStart(day);
  const nextDay = new Date(dayStartValue.getFullYear(), dayStartValue.getMonth(), dayStartValue.getDate() + 1);
  return isRangeBlocked(dayStartValue, nextDay, bookings);
};

export default function PlaceDetailPage() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const placeId = typeof params?.id === "string" ? params.id : "";
  const [guides, setGuides] = useState<Record<string, string>>({});
  const [rules, setRules] = useState("");
  const [bookingStart, setBookingStart] = useState<Date | null>(null);
  const [bookingEnd, setBookingEnd] = useState<Date | null>(null);
  const [availabilityStart, setAvailabilityStart] = useState<Date | null>(null);
  const [availabilityEnd, setAvailabilityEnd] = useState<Date | null>(null);
  const [availabilityHint, setAvailabilityHint] = useState<string | null>(null);
  const [headlineFile, setHeadlineFile] = useState<File | null>(null);
  const [headlinePreview, setHeadlinePreview] = useState<string | null>(null);
  const [headlineError, setHeadlineError] = useState<string | null>(null);
  const [headlineInputKey, setHeadlineInputKey] = useState(0);
  const [headlineModalOpen, setHeadlineModalOpen] = useState(false);
  const apiOptions = useWebApiOptions();
  const placeQuery = usePlaceQuery(placeId, apiOptions);
  const availabilityQuery = useAvailabilityQuery(placeId, apiOptions);
  const guidesQuery = useGuidesQuery(placeId, apiOptions);

  const place = placeQuery.data?.data ?? null;
  const availability = availabilityQuery.data?.data?.ranges ?? [];
  const bookingBlocks = availabilityQuery.data?.data?.bookings ?? [];
  const isOwner = Boolean(availabilityQuery.data?.data?.isOwner);
  const today = useMemo(() => dayStart(new Date()), []);

  useEffect(() => {
    if (placeQuery.data?.data) {
      setRules(placeQuery.data.data.rules ?? "");
    }
  }, [placeQuery.data]);

  useEffect(() => {
    setGuides(guidesQuery.guidesMap);
  }, [guidesQuery.guidesMap]);

  const bookingMutation = useRequestBookingMutation(apiOptions);
  const addAvailabilityMutation = useAddAvailabilityMutation(apiOptions);
  const deleteAvailabilityMutation = useDeleteAvailabilityMutation(apiOptions);
  const rulesMutation = useUpdateRulesMutation(apiOptions);
  const guidesMutation = useUpdateGuidesMutation(apiOptions);
  const uploadHeadlineMutation = useUploadPlaceHeadlineMutation(apiOptions);
  const isUploadingHeadline =
    (uploadHeadlineMutation as { isPending?: boolean }).isPending ??
    (uploadHeadlineMutation as { isLoading?: boolean }).isLoading ??
    false;

  useEffect(() => {
    if (placeQuery.isError || availabilityQuery.isError || guidesQuery.isError) {
      toast.error("Nie udało się pobrać danych miejsca.");
    }
  }, [placeQuery.isError, availabilityQuery.isError, guidesQuery.isError]);

  useEffect(() => {
    if (!headlineFile) {
      setHeadlinePreview(null);
      return;
    }
    const previewUrl = URL.createObjectURL(headlineFile);
    setHeadlinePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [headlineFile]);

  const handleBookingSelect = (date: Date) => {
    setAvailabilityHint(null);
    if (!bookingStart || bookingEnd) {
      setBookingStart(date);
      setBookingEnd(null);
      return;
    }
    if (bookingStart && !bookingEnd) {
      if (isSameDay(date, bookingStart) || isBeforeDay(date, bookingStart)) {
        setBookingStart(date);
        setBookingEnd(null);
        return;
      }
      if (!isRangeAvailable(bookingStart, date, availability)) {
        setAvailabilityHint("Wybrany zakres nie mieści się w dostępności.");
        return;
      }
      setBookingEnd(date);
    }
  };

  const handleAvailabilitySelect = (date: Date) => {
    if (!availabilityStart || availabilityEnd) {
      setAvailabilityStart(date);
      setAvailabilityEnd(null);
      return;
    }
    if (availabilityStart && !availabilityEnd) {
      if (isSameDay(date, availabilityStart) || isBeforeDay(date, availabilityStart)) {
        setAvailabilityStart(date);
        setAvailabilityEnd(null);
        return;
      }
      setAvailabilityEnd(date);
    }
  };

  const canRequestBooking =
    bookingStart && bookingEnd
      ? isAfterDay(bookingEnd, bookingStart) && !isRangeBlocked(bookingStart, bookingEnd, bookingBlocks)
      : false;
  const canSaveAvailability =
    availabilityStart && availabilityEnd ? isAfterDay(availabilityEnd, availabilityStart) : false;
  const sortedAvailability = [...availability].sort(
    (left, right) => new Date(left.startDate).getTime() - new Date(right.startDate).getTime()
  );
  const hasAvailability = sortedAvailability.length > 0;
  const headlineSrc = headlinePreview ?? place?.headlineImageUrl ?? null;

  const formatRangeLabel = (range: AvailabilityRange) => {
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    return `${formatDateLabel(start)} → ${formatDateLabel(end)}`;
  };

  return (
    <div>
      <div className="place-header">
        <button
          type="button"
          className="place-thumbnail-button"
          onClick={() => setHeadlineModalOpen(true)}
          aria-label="Pokaż zdjęcie główne miejsca"
        >
          {headlineSrc ? (
            <img
              className="place-thumbnail"
              src={headlineSrc}
              alt={`Miniatura miejsca ${place?.name ?? ""}`}
            />
          ) : (
            <div className="place-thumbnail place-thumbnail__empty">Brak zdjęcia</div>
          )}
        </button>
        <div style={{ display: "grid", gap: 4 }}>
          <h1 className="page-title">{place?.name ?? "Miejsce"}</h1>
          {place?.address ? <p className="muted">{place.address}</p> : null}
        </div>
      </div>
      <Modal
        isOpen={headlineModalOpen}
        onClose={() => setHeadlineModalOpen(false)}
        title="Zdjęcie główne"
        size="lg"
      >
        <div aria-busy={isUploadingHeadline}>
          {headlineSrc ? (
            <img
              className="place-headline"
              src={headlineSrc}
              alt={`Zdjęcie miejsca ${place?.name ?? ""}`}
            />
          ) : (
            <div className="place-headline__empty">Brak zdjęcia.</div>
          )}
          {isUploadingHeadline ? (
            <div className="upload-status">
              <span className="upload-spinner" aria-hidden="true" />
              <span>Wysyłanie zdjęcia...</span>
            </div>
          ) : null}
        </div>
        {isOwner ? (
          <div style={{ display: "grid", gap: 12 }}>
            <input
              key={headlineInputKey}
              type="file"
              accept="image/*"
              disabled={isUploadingHeadline}
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                if (!file) {
                  setHeadlineFile(null);
                  setHeadlineError(null);
                  return;
                }
                if (file.size > MAX_HEADLINE_BYTES) {
                  setHeadlineError("Plik jest za duży (maks. 5 MB).");
                  setHeadlineFile(null);
                  setHeadlineInputKey((current) => current + 1);
                  return;
                }
                if (file.type && !file.type.startsWith("image/")) {
                  setHeadlineError("Wybierz poprawny plik graficzny.");
                  setHeadlineFile(null);
                  setHeadlineInputKey((current) => current + 1);
                  return;
                }
                setHeadlineError(null);
                setHeadlineFile(file);
              }}
            />
            {headlineError ? <p className="muted">{headlineError}</p> : null}
            <div className="action-bar">
              <button
                type="button"
                disabled={!headlineFile || isUploadingHeadline}
                onClick={() => {
                  if (!headlineFile) {
                    return;
                  }
                  uploadHeadlineMutation.mutate(
                    { placeId, file: headlineFile },
                    {
                      onSuccess: () => {
                        toast.success("Zdjęcie zapisane.");
                        setHeadlineFile(null);
                        setHeadlineError(null);
                        setHeadlineInputKey((current) => current + 1);
                      },
                      onError: () => toast.error("Nie udało się zapisać zdjęcia.")
                    }
                  );
                }}
              >
                {isUploadingHeadline ? (
                  <>
                    <span className="button-spinner" aria-hidden="true" />
                    Wysyłanie...
                  </>
                ) : (
                  "Wyślij zdjęcie"
                )}
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={!headlineFile || isUploadingHeadline}
                onClick={() => {
                  setHeadlineFile(null);
                  setHeadlineError(null);
                  setHeadlineInputKey((current) => current + 1);
                }}
              >
                Wyczyść
              </button>
            </div>
            <p className="muted">Obsługiwane formaty: JPG, PNG, WebP, AVIF (do 5 MB).</p>
          </div>
        ) : null}
      </Modal>
      <div className="place-details-stack">
          {isOwner ? null : (
            <div className="card">
              <h2 className="section-title">Prośba o pobyt</h2>
              <div className="availability-panel">
                <div className="availability-panel__calendar">
                  <AvailabilityCalendar
                    availability={availability}
                    bookings={availabilityQuery.data?.data?.bookings ?? []}
                    selectedStart={bookingStart}
                    selectedEnd={bookingEnd}
                    minDate={today}
                    view="year"
                    isDateDisabled={(date) =>
                      bookingStart && !bookingEnd
                        ? (() => {
                            if (isSameDay(date, bookingStart)) return false;
                            const endLimit = getAvailabilityEndForStart(bookingStart, availability);
                            if (!endLimit) return true;
                            const dayValue = dayStart(date);
                            if (dayValue <= dayStart(bookingStart) || dayValue > endLimit) return true;
                            const endExclusive = new Date(
                              dayValue.getFullYear(),
                              dayValue.getMonth(),
                              dayValue.getDate() + 1
                            );
                            return isRangeBlocked(bookingStart, endExclusive, bookingBlocks);
                          })()
                        : (!isDayAvailable(date, availability) || isDayBlocked(date, bookingBlocks)) &&
                            !(bookingStart && isSameDay(date, bookingStart)) &&
                            !(bookingEnd && isSameDay(date, bookingEnd))
                    }
                    onSelectDay={handleBookingSelect}
                  />
                </div>
                <div className="availability-panel__divider" />
                <div className="availability-panel__list">
                  <div style={{ display: "grid", gap: 8 }}>
                    <div className="availability-selection">
                      <div className="availability-selection__item">
                        <span className="availability-selection__label">Przyjazd</span>
                        <span className="availability-selection__value">{formatDateLabel(bookingStart)}</span>
                      </div>
                      <div className="availability-selection__item">
                        <span className="availability-selection__label">Wyjazd</span>
                        <span className="availability-selection__value">{formatDateLabel(bookingEnd)}</span>
                      </div>
                    </div>
                    <button
                      disabled={!canRequestBooking}
                      onClick={() => {
                        if (!bookingStart || !bookingEnd) {
                          setAvailabilityHint("Wybierz daty przyjazdu i wyjazdu.");
                          return;
                        }
                        if (isRangeBlocked(bookingStart, bookingEnd, bookingBlocks)) {
                          setAvailabilityHint("Wybrane daty są już zarezerwowane.");
                          return;
                        }
                        bookingMutation.mutate(
                          {
                            placeId,
                            startDate: formatDateForApi(bookingStart),
                            endDate: formatDateForApi(bookingEnd)
                          },
                          {
                            onSuccess: () => {
                              toast.success("Prośba wysłana.");
                              router.push("/bookings");
                            },
                            onError: () => toast.error("Nie udało się wysłać prośby.")
                          }
                        );
                      }}
                    >
                      Wyślij
                    </button>
                    {availabilityHint ? <p className="muted">{availabilityHint}</p> : null}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isOwner ? (
            <div className="card">
              <h2 className="section-title">Dodaj dostępność</h2>
              <div className="availability-panel">
                <div className="availability-panel__calendar">
                  <AvailabilityCalendar
                availability={availability}
                bookings={availabilityQuery.data?.data?.bookings ?? []}
                    selectedStart={availabilityStart}
                    selectedEnd={availabilityEnd}
                    minDate={today}
                    view="year"
                    onSelectDay={handleAvailabilitySelect}
                  />
                </div>
                <div className="availability-panel__divider" />
                <div className="availability-panel__list">
                  <div style={{ display: "grid", gap: 8 }}>
                    <div className="availability-selection">
                      <div className="availability-selection__item">
                        <span className="availability-selection__label">Start</span>
                        <span className="availability-selection__value">
                          {formatDateLabel(availabilityStart)}
                        </span>
                      </div>
                      <div className="availability-selection__item">
                        <span className="availability-selection__label">Koniec</span>
                        <span className="availability-selection__value">
                          {formatDateLabel(availabilityEnd)}
                        </span>
                      </div>
                    </div>
                    <button
                      disabled={!canSaveAvailability}
                      onClick={() => {
                        if (!availabilityStart || !availabilityEnd) {
                          toast.error("Wybierz daty dostępności.");
                          return;
                        }
                        addAvailabilityMutation.mutate(
                          {
                            placeId,
                            startDate: formatDateForApi(availabilityStart),
                            endDate: formatDateForApi(availabilityEnd)
                          },
                          {
                            onSuccess: () => {
                              toast.success("Dostępność dodana.");
                              setAvailabilityStart(null);
                              setAvailabilityEnd(null);
                            },
                            onError: () => toast.error("Nie udało się dodać dostępności.")
                          }
                        );
                      }}
                    >
                      Dodaj
                    </button>
                  </div>
                  <h3 className="section-title" style={{ fontSize: 16, marginBottom: 0 }}>
                    Lista terminów
                  </h3>
                  {hasAvailability ? (
                    sortedAvailability.map((range) => (
                      <div
                        key={range.id}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
                      >
                        <span className="muted">{formatRangeLabel(range)}</span>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            deleteAvailabilityMutation.mutate(
                              { rangeId: range.id, placeId },
                              {
                                onError: () => toast.error("Nie udało się usunąć terminu.")
                              }
                            )
                          }
                        >
                          Usuń
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="muted">Brak terminów.</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
          <div className="place-details-row">
            <div className="card">
              <h2 className="section-title">Zasady domu</h2>
              {isOwner ? (
                <div style={{ display: "grid", gap: 12 }}>
                  <textarea value={rules} onChange={(event) => setRules(event.target.value)} rows={4} />
                  <button
                    onClick={() =>
                      rulesMutation.mutate(
                        { placeId, rules },
                        {
                          onSuccess: () => toast.success("Zasady zapisane."),
                          onError: () => toast.error("Nie udało się zapisać zasad.")
                        }
                      )
                    }
                  >
                    Zapisz zasady
                  </button>
                </div>
              ) : (
                <p className="muted">{rules || "Brak zasad."}</p>
              )}
            </div>

            <div className="card">
              <h2 className="section-title">Przewodnik</h2>
              {GUIDE_LABELS.map((item) => (
                <div key={item.key} style={{ display: "grid", gap: 8, marginBottom: 12 }}>
                  <strong>{item.label}</strong>
                  {isOwner ? (
                    <textarea
                      rows={3}
                      value={guides[item.key] ?? ""}
                      onChange={(event) =>
                        setGuides((current) => ({
                          ...current,
                          [item.key]: event.target.value
                        }))
                      }
                    />
                  ) : (
                    <p className="muted">{guides[item.key] ?? "Brak informacji."}</p>
                  )}
                </div>
              ))}
              {isOwner ? (
                <button
                  onClick={() =>
                    guidesMutation.mutate(
                      {
                        placeId,
                        entries: GUIDE_LABELS.map((item) => ({
                          categoryKey: item.key,
                          text: guides[item.key] ?? ""
                        }))
                      },
                      {
                        onSuccess: () => toast.success("Przewodnik zapisany."),
                        onError: () => toast.error("Nie udało się zapisać przewodnika.")
                      }
                    )
                  }
                >
                  Zapisz przewodnik
                </button>
              ) : null}
            </div>
          </div>
        </div>
    </div>
  );
}
