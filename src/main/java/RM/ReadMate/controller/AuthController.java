package RM.ReadMate.controller;

import RM.ReadMate.dto.LoginRequest;
import RM.ReadMate.dto.LoginResponse;
import RM.ReadMate.dto.RegisterRequest;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.UserRepository;
import RM.ReadMate.security.JwtTokenProvider;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public AuthController(AuthenticationManager authenticationManager,
                          JwtTokenProvider tokenProvider,
                          UserRepository userRepository,
                          BCryptPasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // --- 로그인 ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // 1) userid로 회원 조회
        User user = userRepository.findByUserid(loginRequest.getUserId())
                .orElse(null);

        if (user == null) {
            return ResponseEntity
                    .badRequest()
                    .body("등록되지 않은 아이디입니다.");
        }

        // 2) 비밀번호 확인
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity
                    .badRequest()
                    .body("비밀번호가 일치하지 않습니다.");
        }

        // 3) AuthenticationManager로 인증 (UserDetailsService 호출됨)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUserId(),
                        loginRequest.getPassword()
                )
        );

        // 4) 인증 성공 시 JWT 토큰 생성
        String jwt = tokenProvider.createToken(loginRequest.getUserId());

        // 5) 응답으로 토큰과 필요한 사용자 정보 반환
        LoginResponse response = new LoginResponse(
                jwt,
                user.getUserid(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getPoints()
        );
        return ResponseEntity.ok(response);
    }

    // --- 회원가입 ---
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        // 1) userid, email, phone 중복 체크
        if (userRepository.findByUserid(registerRequest.getUserid()).isPresent()) {
            return ResponseEntity.badRequest().body("이미 사용 중인 아이디입니다.");
        }
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body("이미 사용 중인 이메일입니다.");
        }
        if (userRepository.existsByPhone(registerRequest.getPhone())) {
            return ResponseEntity.badRequest().body("이미 사용 중인 전화번호입니다.");
        }

        // 2) User 엔티티 생성 및 저장 (BCrypt로 암호화)
        User newUser = User.builder()
                .userid(registerRequest.getUserid())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .phone(registerRequest.getPhone())
                .gender(registerRequest.getGender())
                .birthdate(registerRequest.getBirthdate())
                .nickname(registerRequest.getNickname())
                .points(0) // 초기 포인트 0
                .build();

        userRepository.save(newUser);
        return ResponseEntity.ok("회원가입이 완료되었습니다.");
    }
}