

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."check_attendance"("dog_uuid" "uuid", "attendance_notes" "text" DEFAULT ''::"text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- 출석 기록 추가
  INSERT INTO public.attendance (dog_id, notes) 
  VALUES (dog_uuid, attendance_notes);
  
  -- 남은 횟수 차감
  PERFORM update_remaining_sessions(dog_uuid);
END;
$$;


ALTER FUNCTION "public"."check_attendance"("dog_uuid" "uuid", "attendance_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_remaining_sessions"("dog_uuid" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE public.dogs 
  SET remaining_sessions = remaining_sessions - 1,
      updated_at = now()
  WHERE id = dog_uuid AND remaining_sessions > 0;
END;
$$;


ALTER FUNCTION "public"."update_remaining_sessions"("dog_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."attendance" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "dog_id" "uuid" NOT NULL,
    "attendance_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "service_type" character varying(10),
    "check_in_time" timestamp without time zone,
    "check_out_time" timestamp without time zone,
    "check_in_date" "date",
    "check_out_date" "date",
    "status" character varying(20) DEFAULT 'active'::character varying,
    "is_paused" boolean DEFAULT false,
    "paused_at" timestamp with time zone,
    "total_paused_duration" integer DEFAULT 0
);


ALTER TABLE "public"."attendance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."care_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "attendance_id" "uuid",
    "care_date" "date",
    "manner_belt_count" integer DEFAULT 0,
    "notes" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "medication_schedule" "jsonb",
    "feeding_schedule" "jsonb",
    "medication_log" "jsonb",
    "feeding_log" "jsonb"
);


ALTER TABLE "public"."care_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "category_code" "text" NOT NULL,
    "category_name_kr" "text" NOT NULL,
    "default_expiry_days" integer DEFAULT 7 NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."categories_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."categories_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."categories_id_seq" OWNED BY "public"."categories"."id";



CREATE TABLE IF NOT EXISTS "public"."coupons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "dog_id" "uuid" NOT NULL,
    "coupon_type" "text" NOT NULL,
    "status" "text" DEFAULT '사용 가능'::"text" NOT NULL,
    "issued_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "used_at" timestamp with time zone
);


ALTER TABLE "public"."coupons" OWNER TO "postgres";


COMMENT ON TABLE "public"."coupons" IS '재등록 시 발급되는 쿠폰(위생미용, 클래스) 정보를 저장합니다.';



COMMENT ON COLUMN "public"."coupons"."dog_id" IS '쿠폰을 소유한 강아지의 ID';



COMMENT ON COLUMN "public"."coupons"."coupon_type" IS '쿠폰 종류 (예: 위생미용, 퍼피빌 클래스)';



COMMENT ON COLUMN "public"."coupons"."status" IS '쿠폰 상태 (사용 가능, 사용 완료)';



CREATE TABLE IF NOT EXISTS "public"."dogs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "breed" "text" NOT NULL,
    "birth_date" "date",
    "gender" "text",
    "registration_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "total_sessions" integer DEFAULT 0 NOT NULL,
    "remaining_sessions" integer DEFAULT 0 NOT NULL,
    "special_notes" "text",
    "image_url" "text",
    "owner_name" "text" NOT NULL,
    "owner_phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "type" "text" DEFAULT 'kindergarten'::"text" NOT NULL,
    "initial_sessions" integer DEFAULT 0,
    CONSTRAINT "dogs_gender_check" CHECK (("gender" = ANY (ARRAY['수컷'::"text", '암컷'::"text"]))),
    CONSTRAINT "dogs_type_check" CHECK (("type" = ANY (ARRAY['kindergarten'::"text", 'daycare'::"text", 'hotel'::"text"])))
);


ALTER TABLE "public"."dogs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expiry_rules" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "match_type" "text" NOT NULL,
    "pattern" "text" NOT NULL,
    "override_days" integer NOT NULL,
    "notes" "text",
    CONSTRAINT "expiry_rules_match_type_check" CHECK (("match_type" = ANY (ARRAY['regex'::"text", 'exact'::"text"])))
);


ALTER TABLE "public"."expiry_rules" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."expiry_rules_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."expiry_rules_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."expiry_rules_id_seq" OWNED BY "public"."expiry_rules"."id";



CREATE TABLE IF NOT EXISTS "public"."hotel_bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "dog_id" "uuid" NOT NULL,
    "check_in_date" "date" NOT NULL,
    "check_out_date" "date" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "valid_dates" CHECK (("check_out_date" >= "check_in_date"))
);


ALTER TABLE "public"."hotel_bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hotel_care_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "care_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "manner_belt_changes" integer DEFAULT 0 NOT NULL,
    "morning_meal_given" boolean DEFAULT false NOT NULL,
    "afternoon_meal_given" boolean DEFAULT false NOT NULL,
    "evening_meal_given" boolean DEFAULT false NOT NULL,
    "morning_medicine_given" boolean DEFAULT false NOT NULL,
    "evening_medicine_given" boolean DEFAULT false NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."hotel_care_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "receipt_item_id" bigint,
    "category_id" bigint,
    "barcode" "text",
    "name" "text" NOT NULL,
    "purchase_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "expiry_date" "date" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "source_type" "text" DEFAULT 'receipt'::"text",
    "store_name" "text",
    "raw_text" "text",
    "receipt_image_url" "text",
    CONSTRAINT "inventory_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'consumed'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."inventory" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."inventory_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."inventory_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."inventory_id_seq" OWNED BY "public"."inventory"."id";



CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "barcode" "text" NOT NULL,
    "product_name" "text" NOT NULL,
    "category_id" bigint,
    "manufacturer" "text" DEFAULT '알 수 없음'::"text",
    "source" "text" DEFAULT 'unknown'::"text",
    "verified" boolean DEFAULT false
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."re_registrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "dog_id" "uuid" NOT NULL,
    "sessions_added" integer DEFAULT 0 NOT NULL,
    "registration_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."re_registrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."receipt_items" (
    "id" bigint NOT NULL,
    "receipt_id" bigint NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "raw_text" "text" NOT NULL,
    "clean_text" "text",
    "category_id" bigint,
    "expiry_days" integer,
    "status" "text" DEFAULT 'parsed'::"text",
    CONSTRAINT "receipt_items_status_check" CHECK (("status" = ANY (ARRAY['parsed'::"text", 'added_to_inventory'::"text", 'ignored'::"text"])))
);


ALTER TABLE "public"."receipt_items" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."receipt_items_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."receipt_items_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."receipt_items_id_seq" OWNED BY "public"."receipt_items"."id";



CREATE TABLE IF NOT EXISTS "public"."receipts" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "store_name" "text",
    "purchase_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "image_url" "text",
    "ocr_text" "text"
);


ALTER TABLE "public"."receipts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."receipts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."receipts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."receipts_id_seq" OWNED BY "public"."receipts"."id";



CREATE OR REPLACE VIEW "public"."upcoming_expirations" AS
 SELECT "id",
    "user_id",
    "name",
    "category_id",
    "expiry_date",
    "purchase_date",
    "status",
    "quantity",
    ("expiry_date" - CURRENT_DATE) AS "days_remaining"
   FROM "public"."inventory"
  WHERE ("status" = 'active'::"text")
  ORDER BY "expiry_date";


ALTER VIEW "public"."upcoming_expirations" OWNER TO "postgres";


ALTER TABLE ONLY "public"."categories" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."categories_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."expiry_rules" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."expiry_rules_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."inventory" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."inventory_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."receipt_items" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."receipt_items_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."receipts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."receipts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."attendance"
    ADD CONSTRAINT "attendance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."care_logs"
    ADD CONSTRAINT "care_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_category_code_key" UNIQUE ("category_code");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."coupons"
    ADD CONSTRAINT "coupons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dogs"
    ADD CONSTRAINT "dogs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expiry_rules"
    ADD CONSTRAINT "expiry_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hotel_bookings"
    ADD CONSTRAINT "hotel_bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hotel_care_logs"
    ADD CONSTRAINT "hotel_care_logs_booking_id_care_date_key" UNIQUE ("booking_id", "care_date");



ALTER TABLE ONLY "public"."hotel_care_logs"
    ADD CONSTRAINT "hotel_care_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory"
    ADD CONSTRAINT "inventory_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_barcode_key" UNIQUE ("barcode");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."re_registrations"
    ADD CONSTRAINT "re_registrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."receipt_items"
    ADD CONSTRAINT "receipt_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."receipts"
    ADD CONSTRAINT "receipts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."care_logs"
    ADD CONSTRAINT "unique_attendance_care_date" UNIQUE ("attendance_id", "care_date");



CREATE INDEX "idx_inventory_barcode" ON "public"."inventory" USING "btree" ("barcode");



CREATE INDEX "idx_inventory_expiry_date" ON "public"."inventory" USING "btree" ("expiry_date");



CREATE INDEX "idx_inventory_status" ON "public"."inventory" USING "btree" ("status");



CREATE INDEX "idx_inventory_user_id" ON "public"."inventory" USING "btree" ("user_id");



CREATE INDEX "idx_products_barcode" ON "public"."products" USING "btree" ("barcode");



CREATE INDEX "idx_re_registrations_date" ON "public"."re_registrations" USING "btree" ("registration_date");



CREATE INDEX "idx_re_registrations_dog_id" ON "public"."re_registrations" USING "btree" ("dog_id");



CREATE OR REPLACE TRIGGER "handle_inventory_updated_at" BEFORE UPDATE ON "public"."inventory" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_products_updated_at" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_hotel_bookings_updated_at" BEFORE UPDATE ON "public"."hotel_bookings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_hotel_care_logs_updated_at" BEFORE UPDATE ON "public"."hotel_care_logs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."attendance"
    ADD CONSTRAINT "attendance_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "public"."dogs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."care_logs"
    ADD CONSTRAINT "care_logs_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "public"."attendance"("id");



ALTER TABLE ONLY "public"."coupons"
    ADD CONSTRAINT "coupons_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "public"."dogs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hotel_bookings"
    ADD CONSTRAINT "hotel_bookings_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "public"."dogs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hotel_care_logs"
    ADD CONSTRAINT "hotel_care_logs_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."hotel_bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inventory"
    ADD CONSTRAINT "inventory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."inventory"
    ADD CONSTRAINT "inventory_receipt_item_id_fkey" FOREIGN KEY ("receipt_item_id") REFERENCES "public"."receipt_items"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."inventory"
    ADD CONSTRAINT "inventory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."re_registrations"
    ADD CONSTRAINT "re_registrations_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "public"."dogs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."receipt_items"
    ADD CONSTRAINT "receipt_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."receipt_items"
    ADD CONSTRAINT "receipt_items_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "public"."receipts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."receipt_items"
    ADD CONSTRAINT "receipt_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."receipts"
    ADD CONSTRAINT "receipts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow ALL operations for OWN user" ON "public"."inventory" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow ALL operations for OWN user" ON "public"."receipt_items" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow ALL operations for OWN user" ON "public"."receipts" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow admin full access" ON "public"."coupons" TO "authenticated" USING (true);



CREATE POLICY "Allow insert for authenticated users" ON "public"."products" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow public read access" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."expiry_rules" FOR SELECT USING (true);



CREATE POLICY "Allow read access to all users" ON "public"."products" FOR SELECT USING (true);



ALTER TABLE "public"."expiry_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hotel_bookings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "관리자는 모든 강아지 정보 관리 가능" ON "public"."dogs" TO "authenticated" USING (true);



CREATE POLICY "관리자만 재등록 기록 삭제 가능" ON "public"."re_registrations" FOR DELETE USING (true);



CREATE POLICY "관리자만 재등록 기록 수정 가능" ON "public"."re_registrations" FOR UPDATE USING (true);



CREATE POLICY "관리자만 재등록 기록 입력 가능" ON "public"."re_registrations" FOR INSERT WITH CHECK (true);



CREATE POLICY "관리자만 출석 기록 입력 가능" ON "public"."attendance" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "관리자만 호텔 예약 관리 가능" ON "public"."hotel_bookings" USING (true);



CREATE POLICY "관리자만 호텔 케어 로그 관리 가능" ON "public"."hotel_care_logs" USING (true);



CREATE POLICY "보호자는 자신의 강아지만 조회 가능" ON "public"."dogs" FOR SELECT TO "anon" USING (true);



CREATE POLICY "보호자는 자신의 호텔 예약만 조회 가능" ON "public"."hotel_bookings" FOR SELECT USING (true);



CREATE POLICY "보호자는 자신의 호텔 케어 로그만 조회 가능" ON "public"."hotel_care_logs" FOR SELECT USING (true);



CREATE POLICY "재등록 기록 조회 정책" ON "public"."re_registrations" FOR SELECT USING (true);



CREATE POLICY "출석 기록 수정 정책" ON "public"."attendance" FOR UPDATE USING (true);



CREATE POLICY "출석 기록 조회 정책" ON "public"."attendance" FOR SELECT TO "authenticated", "anon" USING (true);



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."check_attendance"("dog_uuid" "uuid", "attendance_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_attendance"("dog_uuid" "uuid", "attendance_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_attendance"("dog_uuid" "uuid", "attendance_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_remaining_sessions"("dog_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_remaining_sessions"("dog_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_remaining_sessions"("dog_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."attendance" TO "anon";
GRANT ALL ON TABLE "public"."attendance" TO "authenticated";
GRANT ALL ON TABLE "public"."attendance" TO "service_role";



GRANT ALL ON TABLE "public"."care_logs" TO "anon";
GRANT ALL ON TABLE "public"."care_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."care_logs" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."coupons" TO "anon";
GRANT ALL ON TABLE "public"."coupons" TO "authenticated";
GRANT ALL ON TABLE "public"."coupons" TO "service_role";



GRANT ALL ON TABLE "public"."dogs" TO "anon";
GRANT ALL ON TABLE "public"."dogs" TO "authenticated";
GRANT ALL ON TABLE "public"."dogs" TO "service_role";



GRANT ALL ON TABLE "public"."expiry_rules" TO "anon";
GRANT ALL ON TABLE "public"."expiry_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."expiry_rules" TO "service_role";



GRANT ALL ON SEQUENCE "public"."expiry_rules_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."expiry_rules_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."expiry_rules_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."hotel_bookings" TO "anon";
GRANT ALL ON TABLE "public"."hotel_bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."hotel_bookings" TO "service_role";



GRANT ALL ON TABLE "public"."hotel_care_logs" TO "anon";
GRANT ALL ON TABLE "public"."hotel_care_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."hotel_care_logs" TO "service_role";



GRANT ALL ON TABLE "public"."inventory" TO "anon";
GRANT ALL ON TABLE "public"."inventory" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory" TO "service_role";



GRANT ALL ON SEQUENCE "public"."inventory_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."inventory_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."inventory_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."re_registrations" TO "anon";
GRANT ALL ON TABLE "public"."re_registrations" TO "authenticated";
GRANT ALL ON TABLE "public"."re_registrations" TO "service_role";



GRANT ALL ON TABLE "public"."receipt_items" TO "anon";
GRANT ALL ON TABLE "public"."receipt_items" TO "authenticated";
GRANT ALL ON TABLE "public"."receipt_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."receipt_items_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."receipt_items_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."receipt_items_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."receipts" TO "anon";
GRANT ALL ON TABLE "public"."receipts" TO "authenticated";
GRANT ALL ON TABLE "public"."receipts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."receipts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."receipts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."receipts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."upcoming_expirations" TO "anon";
GRANT ALL ON TABLE "public"."upcoming_expirations" TO "authenticated";
GRANT ALL ON TABLE "public"."upcoming_expirations" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






