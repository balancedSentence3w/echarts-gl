module.exports = "\n@export ecgl.common.transformUniforms\nuniform mat4 worldViewProjection : WORLDVIEWPROJECTION;\nuniform mat4 worldInverseTranspose : WORLDINVERSETRANSPOSE;\nuniform mat4 world : WORLD;\n@end\n\n@export ecgl.common.attributes\nattribute vec3 position : POSITION;\nattribute vec2 texcoord : TEXCOORD_0;\nattribute vec3 normal : NORMAL;\n@end\n\n@export ecgl.common.uvUniforms\nuniform vec2 uvRepeat : [1.0, 1.0];\nuniform vec2 uvOffset : [0.0, 0.0];\n@end\n\n\n@export ecgl.common.wireframe.vertexHeader\n\n#ifdef WIREFRAME_QUAD\nattribute vec4 barycentric;\nvarying vec4 v_Barycentric;\n#elif defined(WIREFRAME_TRIANGLE)\nattribute vec3 barycentric;\nvarying vec3 v_Barycentric;\n#endif\n\n@end\n\n@export ecgl.common.wireframe.vertexMain\n\n#if defined(WIREFRAME_QUAD) || defined(WIREFRAME_TRIANGLE)\n    v_Barycentric = barycentric;\n#endif\n\n@end\n\n\n@export ecgl.common.wireframe.fragmentHeader\n\nuniform float wireframeLineWidth : 1;\nuniform vec4 wireframeLineColor: [0, 0, 0, 0.5];\n\n#ifdef WIREFRAME_QUAD\nvarying vec4 v_Barycentric;\nfloat edgeFactor () {\n    vec4 d = fwidth(v_Barycentric);\n    vec4 a4 = smoothstep(vec4(0.0), d * wireframeLineWidth, v_Barycentric);\n    return min(min(min(a4.x, a4.y), a4.z), a4.w);\n}\n#elif defined(WIREFRAME_TRIANGLE)\nvarying vec3 v_Barycentric;\nfloat edgeFactor () {\n    vec3 d = fwidth(v_Barycentric);\n    vec3 a3 = smoothstep(vec3(0.0), d * wireframeLineWidth, v_Barycentric);\n    return min(min(a3.x, a3.y), a3.z);\n}\n#endif\n\n@end\n\n\n@export ecgl.common.wireframe.fragmentMain\n\n#if defined(WIREFRAME_QUAD) || defined(WIREFRAME_TRIANGLE)\n    if (wireframeLineWidth > 0.) {\n        vec4 lineColor = wireframeLineColor;\n#ifdef SRGB_DECODE\n        lineColor = sRGBToLinear(lineColor);\n#endif\n\n        gl_FragColor.rgb = mix(gl_FragColor.rgb, lineColor.rgb, (1.0 - edgeFactor()) * lineColor.a);\n    }\n#endif\n@end\n\n\n\n\n@export ecgl.common.bumpmap.header\n\n#ifdef BUMPMAP_ENABLED\nuniform sampler2D bumpMap;\nuniform float bumpScale : 1.0;\n\n\nvec3 bumpNormal(vec3 surfPos, vec3 surfNormal, vec3 baseNormal)\n{\n    vec2 dSTdx = dFdx(v_Texcoord);\n    vec2 dSTdy = dFdy(v_Texcoord);\n\n    float Hll = bumpScale * texture2D(bumpMap, v_Texcoord).x;\n    float dHx = bumpScale * texture2D(bumpMap, v_Texcoord + dSTdx).x - Hll;\n    float dHy = bumpScale * texture2D(bumpMap, v_Texcoord + dSTdy).x - Hll;\n\n    vec3 vSigmaX = dFdx(surfPos);\n    vec3 vSigmaY = dFdy(surfPos);\n    vec3 vN = surfNormal;\n\n    vec3 R1 = cross(vSigmaY, vN);\n    vec3 R2 = cross(vN, vSigmaX);\n\n    float fDet = dot(vSigmaX, R1);\n\n    vec3 vGrad = sign(fDet) * (dHx * R1 + dHy * R2);\n    return normalize(abs(fDet) * baseNormal - vGrad);\n\n}\n#endif\n\n@end\n\n@export ecgl.common.normalMap.vertexHeader\n\n#ifdef NORMALMAP_ENABLED\nattribute vec4 tangent : TANGENT;\nvarying vec3 v_Tangent;\nvarying vec3 v_Bitangent;\n#endif\n\n@end\n\n@export ecgl.common.normalMap.vertexMain\n\n#ifdef NORMALMAP_ENABLED\n    if (dot(tangent, tangent) > 0.0) {\n        v_Tangent = normalize((worldInverseTranspose * vec4(tangent.xyz, 0.0)).xyz);\n        v_Bitangent = normalize(cross(v_Normal, v_Tangent) * tangent.w);\n    }\n#endif\n\n@end\n\n\n@export ecgl.common.normalMap.fragmentHeader\n\n#ifdef NORMALMAP_ENABLED\nuniform sampler2D normalMap;\nvarying vec3 v_Tangent;\nvarying vec3 v_Bitangent;\n#endif\n\n@end\n\n@export ecgl.common.normalMap.fragmentMain\n#ifdef NORMALMAP_ENABLED\n    if (dot(v_Tangent, v_Tangent) > 0.0) {\n        vec3 normalTexel = texture2D(normalMap, v_Texcoord).xyz;\n        if (dot(normalTexel, normalTexel) > 0.0) {             N = normalTexel * 2.0 - 1.0;\n            mat3 tbn = mat3(v_Tangent, v_Bitangent, v_Normal);\n            N = normalize(tbn * N);\n        }\n    }\n#endif\n@end\n\n\n\n@export ecgl.common.vertexAnimation.header\n\n#ifdef VERTEX_ANIMATION\nattribute vec3 prevPosition;\nattribute vec3 prevNormal;\nuniform float percent;\n#endif\n\n@end\n\n@export ecgl.common.vertexAnimation.main\n\n#ifdef VERTEX_ANIMATION\n    vec3 pos = mix(prevPosition, position, percent);\n    vec3 norm = mix(prevNormal, normal, percent);\n#else\n    vec3 pos = position;\n    vec3 norm = normal;\n#endif\n\n@end\n\n\n\n\n@export ecgl.common.diffuseLayer.header\n\n#if (LAYER_DIFFUSEMAP_COUNT > 0)\nuniform float layerDiffuseIntensity[LAYER_DIFFUSEMAP_COUNT];\nuniform sampler2D layerDiffuseMap[LAYER_DIFFUSEMAP_COUNT];\n#endif\n\n@end\n\n@export ecgl.common.emissiveLayer.header\n\n#if (LAYER_EMISSIVEMAP_COUNT > 0)\nuniform float layerEmissionIntensity[LAYER_EMISSIVEMAP_COUNT];\nuniform sampler2D layerEmissiveMap[LAYER_EMISSIVEMAP_COUNT];\n#endif\n\n@end\n\n@export ecgl.common.layers.header\n@import ecgl.common.diffuseLayer.header\n@import ecgl.common.emissiveLayer.header\n@end\n\n@export ecgl.common.diffuseLayer.main\n\n#if (LAYER_DIFFUSEMAP_COUNT > 0)\n    for (int _idx_ = 0; _idx_ < LAYER_DIFFUSEMAP_COUNT; _idx_++) {{\n        float intensity = layerDiffuseIntensity[_idx_];\n        vec4 texel2 = texture2D(layerDiffuseMap[_idx_], v_Texcoord);\n        #ifdef SRGB_DECODE\n        texel2 = sRGBToLinear(texel2);\n        #endif\n                albedoTexel.rgb = mix(albedoTexel.rgb, texel2.rgb * intensity, texel2.a);\n        albedoTexel.a = texel2.a + (1.0 - texel2.a) * albedoTexel.a;\n    }}\n#endif\n\n@end\n\n@export ecgl.common.emissiveLayer.main\n\n#if (LAYER_EMISSIVEMAP_COUNT > 0)\n    for (int _idx_ = 0; _idx_ < LAYER_EMISSIVEMAP_COUNT; _idx_++)\n    {{\n                vec4 texel2 = texture2D(layerEmissiveMap[_idx_], v_Texcoord) * layerEmissionIntensity[_idx_];\n        float intensity = layerEmissionIntensity[_idx_];\n        gl_FragColor.rgb += texel2.rgb * texel2.a * intensity;\n    }}\n#endif\n\n@end\n";
